import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format rupiah ringkas ala "Rp 3,1 M" / "Rp 640 jt", dipakai di daftar
 * padat (dashboard) tempat nilai penuh terlalu panjang untuk satu baris.
 */
export function formatCurrencyCompact(value: number): string {
    const miliar = value / 1_000_000_000;

    if (Math.abs(miliar) >= 1) {
        return `Rp ${miliar.toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
    }

    const juta = value / 1_000_000;

    return `Rp ${juta.toLocaleString('id-ID', { maximumFractionDigits: 0 })} jt`;
}

/**
 * Format tanggal Y-m-d dari server menjadi tanggal panjang Indonesia.
 * Mengembalikan '-' bila tanggal belum diisi.
 */
export function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
    }).format(new Date(value));
}
