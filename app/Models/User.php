<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_EXECUTIVE = 'executive';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_USER = 'user';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'department_id',
        'role',
        'is_active',
        'approval_position',
        'google2fa_secret',
        'two_factor_enabled',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google2fa_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'two_factor_enabled'      => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'google2fa_secret'        => 'encrypted',
        ];
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public static function roles(): array
    {
        return [
            self::ROLE_EXECUTIVE,
            self::ROLE_ADMIN,
            self::ROLE_USER,
        ];
    }

    public function isExecutive(): bool
    {
        return $this->role === self::ROLE_EXECUTIVE;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isStandardUser(): bool
    {
        return !$this->isExecutive() && !$this->isAdmin();
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function canViewAllDepartments(): bool
    {
        return $this->hasAnyRole([self::ROLE_EXECUTIVE, self::ROLE_ADMIN]);
    }

    public function canManageAssets(): bool
    {
        return $this->isAdmin();
    }

    public function canManageAdministration(): bool
    {
        return $this->isAdmin();
    }

    public function canAccessProcurement(): bool
    {
        return $this->hasAnyRole([self::ROLE_EXECUTIVE, self::ROLE_ADMIN]);
    }

    public function dashboardRouteName(): string
    {
        return $this->isExecutive() ? 'executive.dashboard' : 'asset-management.index';
    }
}
