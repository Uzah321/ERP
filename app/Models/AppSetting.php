<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $table = 'app_settings';
    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value]);
    }

    public static function setMany(array $data, string $prefix = ''): void
    {
        foreach ($data as $key => $value) {
            static::set($prefix ? "{$prefix}.{$key}" : $key, $value);
        }
    }

    public static function group(string $prefix): array
    {
        return static::where('key', 'like', "{$prefix}.%")
            ->pluck('value', 'key')
            ->mapWithKeys(fn($v, $k) => [substr($k, strlen($prefix) + 1) => $v])
            ->toArray();
    }
}
