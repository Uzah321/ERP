<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'd.zondo@simbisa.co.zw')->first();
if ($user) {
    if (method_exists($user, 'assignRole')) {
        $user->assignRole(['admin', 'executive', 'officer']);
    } else {
        $user->role = 'admin';
        $user->save();
    }
    echo "Updated " . $user->email . " with full access roles\n";
} else {
    echo "User not found. Run migrations and seeders first?\n";
}
