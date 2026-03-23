<?php

namespace App\Http\Controllers;

use App\Mail\CapexApprovalRequest;
use App\Mail\CapexFullyApproved;
use App\Models\AssetRequest;
use App\Models\CapexApproval;
use App\Models\CapexForm;
use App\Models\User;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CapexController extends Controller
{
    /**
     * Download the CAPEX form as a PDF.
     */
    public function downloadPdf(CapexForm $capexForm)
    {
        $capexForm->loadMissing([
            'assetRequest.user',
            'assetRequest.department',
            'approvals',
        ]);

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $dompdf = new Dompdf($options);

        $html = view('pdf.capex-form', ['capex' => $capexForm])->render();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $filename = $capexForm->rtp_reference . '.pdf';

        return response($dompdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * List all CAPEX forms (admin view).
     */
    public function index(Request $request)
    {
        // Legacy status label map for backward compatibility
        $legacyLabels = [
            'pending_it_manager'          => 'Pending IT Manager',
            'pending_finance_operations'  => 'Pending Finance Operations',
            'pending_it_head'             => 'Pending IT Head',
            'pending_finance_director'    => 'Pending Finance Director',
        ];

        $forms = CapexForm::with(['assetRequest.user', 'assetRequest.department', 'approvals'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($sub) use ($search) {
                    $sub->where('rtp_reference', 'like', "%{$search}%")
                        ->orWhereHas('assetRequest.department', fn($d) => $d->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('assetRequest.user', fn($u) => $u->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(15)
            ->through(function ($f) use ($legacyLabels) {
                // Compute a human-readable current stage label
                if ($f->status === 'approved') {
                    $stageLabel = 'Fully Approved';
                } elseif ($f->status === 'declined') {
                    $stageLabel = 'Declined';
                } elseif ($f->status === 'pending' && !empty($f->approval_chain)) {
                    $stage = $f->approval_chain[$f->current_stage_index] ?? null;
                    $stageLabel = $stage ? ('Pending ' . $stage['label']) : 'Pending';
                } else {
                    // Legacy fixed-status forms
                    $stageLabel = $legacyLabels[$f->status] ?? $f->status;
                }

                return [
                    'id'                  => $f->id,
                    'rtp_reference'       => $f->rtp_reference,
                    'department'          => $f->assetRequest->department?->name ?? '-',
                    'requested_by'        => $f->assetRequest->user?->name ?? '-',
                    'request_type'        => $f->request_type,
                    'status'              => $f->status,
                    'current_stage_label' => $stageLabel,
                    'current_stage_index' => $f->current_stage_index ?? 0,
                    'chain_length'        => count($f->approval_chain ?? []),
                    'items_count'         => count($f->items ?? []),
                    'total_amount'        => $f->total_amount,
                    'created_at'          => $f->created_at->format('d M Y'),
                ];
            });

        // Approved asset requests that don't yet have a CAPEX form
        $usedIds = CapexForm::pluck('asset_request_id')->toArray();
        $assetRequests = AssetRequest::with('department')
            ->where('status', 'approved')
            ->whereNotIn('id', $usedIds)
            ->latest()
            ->get()
            ->map(fn($r) => [
                'id'              => $r->id,
                'asset_type'      => $r->asset_type ?? $r->asset_category,
                'department_name' => $r->department?->name ?? '-',
            ]);

        // All active users — for the approval chain builder
        $users = User::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'               => $u->id,
                'name'             => $u->name,
                'approval_position'=> $u->approval_position,
            ]);

        return Inertia::render('Admin/CapexForms', [
            'forms'         => $forms,
            'assetRequests' => $assetRequests,
            'users'         => $users,
            'filters'       => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Create a CAPEX form from an approved AssetRequest.
     * Items are sorted ascending by estimated unit price (if provided), otherwise by order.
     */
    public function store(Request $request)
    {
        $request->validate([
            'asset_request_id'    => 'required|exists:asset_requests,id',
            'request_type'        => 'required|string|max:255',
            'asset_life'          => 'required|string|max:100',
            'cost_allocation'     => 'nullable|string|max:255',
            'insurance_status'    => 'boolean',
            'reason_for_purchase' => 'nullable|string',
            'quotations'          => 'required|array|min:3|max:10',
            'quotations.*'        => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'total_amount'        => 'required|numeric|min:0',
        ], [
            'total_amount.required' => 'Please enter the total order amount (from the cheapest quotation).',
            'total_amount.numeric'  => 'Total amount must be a number.',
            'total_amount.min'      => 'Total amount cannot be negative.',
            'quotations.required' => 'Please upload at least 3 vendor quotations.',
            'quotations.min'      => 'At least 3 vendor quotations are required.',
            'quotations.*.mimes'  => 'Each quotation must be a PDF, Word document, or image.',
            'quotations.*.max'    => 'Each quotation file must not exceed 10MB.',
        ]);

        // Decode and validate the approval chain
        $chainRaw = $request->input('approval_chain');
        $chain    = is_string($chainRaw) ? json_decode($chainRaw, true) : $chainRaw;

        if (!is_array($chain) || count($chain) === 0) {
            return back()->withErrors(['approval_chain' => 'At least one approver must be added to the approval chain.']);
        }

        foreach ($chain as $i => $stage) {
            if (empty($stage['user_id']) || empty(trim($stage['label'] ?? ''))) {
                return back()->withErrors(['approval_chain' => "Stage " . ($i + 1) . ": please select a user and enter a role label."]);
            }
            // Verify selected user exists
            if (!User::where('id', $stage['user_id'])->where('is_active', true)->exists()) {
                return back()->withErrors(['approval_chain' => "Stage " . ($i + 1) . ": selected user not found or is inactive."]);
            }
        }

        $assetRequest = AssetRequest::with(['user', 'department'])->findOrFail($request->asset_request_id);

        // Prevent duplicate CAPEX for same request
        if (CapexForm::where('asset_request_id', $assetRequest->id)->exists()) {
            return back()->withErrors(['asset_request_id' => 'A CAPEX form already exists for this request.']);
        }

        $ref = 'SRQ-' . now()->format('Y') . '-' . str_pad($assetRequest->id, 4, '0', STR_PAD_LEFT);

        // Sort items by unit_price ascending (if provided)
        $items = $assetRequest->items ?? [];
        usort($items, fn($a, $b) => (float)($a['unit_price'] ?? 0) <=> (float)($b['unit_price'] ?? 0));

        // Store uploaded quotation files
        $quotationPaths = [];
        foreach ($request->file('quotations') as $file) {
            $quotationPaths[] = $file->store('capex-quotations', 'local');
        }

        $capex = CapexForm::create([
            'asset_request_id'    => $assetRequest->id,
            'rtp_reference'       => $ref,
            'request_type'        => $request->request_type,
            'asset_life'          => $request->asset_life,
            'cost_allocation'     => $request->cost_allocation,
            'insurance_status'    => $request->boolean('insurance_status', true),
            'reason_for_purchase' => $request->reason_for_purchase,
            'items'               => $items,
            'quotations'          => $quotationPaths,
            'approval_chain'      => $chain,
            'current_stage_index' => 0,
            'total_amount'        => $request->total_amount,
            'status'              => 'pending',
        ]);

        // Create first approval record from chain[0]
        $firstStage  = $chain[0];
        $firstUser   = User::find($firstStage['user_id']);
        $approval    = $capex->approvals()->create([
            'approval_position' => $firstStage['label'],
            'approver_id'       => $firstUser?->id,
            'approver_name'     => $firstUser?->name,
            'status'            => 'pending',
            'token'             => Str::random(64),
        ]);

        // Email the first approver
        if ($firstUser) {
            Mail::to($firstUser->email)->send(new CapexApprovalRequest($approval));
        }

        return back()->with('success', 'CAPEX form created and sent to ' . $firstStage['label'] . ' for approval.');
    }

    /**
     * Show the approval confirmation page (GET — approver clicks link from email).
     */
    public function showApprove(string $token)
    {
        $approval = CapexApproval::where('token', $token)
            ->where('status', 'pending')
            ->with('capexForm.assetRequest.department')
            ->firstOrFail();

        return Inertia::render('Capex/Approve', [
            'approval' => [
                'id'               => $approval->id,
                'token'            => $approval->token,
                'position_label'   => $approval->positionLabel(),
                'rtp_reference'    => $approval->capexForm->rtp_reference,
                'department'       => $approval->capexForm->assetRequest->department?->name ?? '-',
                'request_type'     => $approval->capexForm->request_type,
                'total_amount'     => $approval->capexForm->total_amount,
                'items'            => $approval->capexForm->items,
            ],
        ]);
    }

    /**
     * Handle the approval/decline submission (POST — approver submits password).
     */
    public function processApprove(Request $request, string $token)
    {
        $request->validate([
            'password' => 'required|string',
            'decision' => 'required|in:approved,declined',
        ]);

        $approval = CapexApproval::where('token', $token)
            ->where('status', 'pending')
            ->with('capexForm.assetRequest.user')
            ->firstOrFail();

        // Verify password of the approver
        $approver = $approval->approver_id
            ? User::find($approval->approver_id)
            : User::where('approval_position', $approval->approval_position)->where('is_active', true)->first();

        if (!$approver || !Hash::check($request->password, $approver->password)) {
            return back()->withErrors(['password' => 'Incorrect password. Approval not recorded.']);
        }

        $capex = $approval->capexForm;

        // Record the decision
        $approval->update([
            'status'        => $request->decision,
            'approver_id'   => $approver->id,
            'approver_name' => $approver->name,
            'signed_at'     => now(),
        ]);

        if ($request->decision === 'declined') {
            $capex->update(['status' => 'declined']);
            // Notify the requester
            Mail::to($capex->assetRequest->user->email)
                ->send(new CapexFullyApproved($capex)); // reuses same mail, status will say declined
            return Inertia::render('Capex/ApproveResult', [
                'result'        => 'declined',
                'rtp_reference' => $capex->rtp_reference,
                'position'      => $approval->positionLabel(),
            ]);
        }

        // Advance to next stage
        $nextApproval = $capex->advanceStage();

        if ($nextApproval) {
            // Email the next approver
            $nextApprover = $nextApproval->approver_id
                ? User::find($nextApproval->approver_id)
                : User::where('approval_position', $nextApproval->approval_position)->where('is_active', true)->first();
            if ($nextApprover) {
                Mail::to($nextApprover->email)->send(new CapexApprovalRequest($nextApproval));
            }
        } else {
            // Fully approved — notify requester
            Mail::to($capex->assetRequest->user->email)->send(new CapexFullyApproved($capex));
        }

        return Inertia::render('Capex/ApproveResult', [
            'result'        => 'approved',
            'rtp_reference' => $capex->rtp_reference,
            'position'      => $approval->positionLabel(),
            'fully_approved'=> $capex->status === 'approved',
        ]);
    }
}
