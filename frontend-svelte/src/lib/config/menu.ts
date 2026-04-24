import {
	LayoutDashboard,
	FileText,
	CheckSquare,
	Receipt,
	Settings,
	Users,
	Mail,
	FileSignature
} from 'lucide-svelte';
import type { ComponentType } from 'svelte';
import type { Icon } from 'lucide-svelte';

export interface RouteItem {
	name: string;
	path: string;
	icon: ComponentType<Icon>;
	roles: string[];
}

export const APP_ROUTES: RouteItem[] = [
	{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Admin', 'Pegawai', 'PPK', 'Direktur'] },
	{ name: 'Surat Tugas (SPT)', path: '/spt', icon: FileText, roles: ['Super Admin', 'Admin', 'Pegawai', 'PPK', 'Direktur'] },
	{ name: 'SPTJM (Biaya Rill)', path: '/sptjm', icon: CheckSquare, roles: ['Super Admin', 'Admin', 'Pegawai', 'PPK', 'Direktur'] },
	{ name: 'Kwitansi & SPD', path: '/kwitansi-spj', icon: Receipt, roles: ['Super Admin', 'Admin', 'Pegawai', 'PPK', 'Direktur'] },
	{ name: 'Arsip Persuratan', path: '/arsip-surat', icon: Mail, roles: ['Super Admin', 'Admin', 'Pegawai', 'PPK', 'Direktur'] },
	{ name: 'Data Pegawai', path: '/pegawai', icon: Users, roles: ['Super Admin', 'Admin', 'Pegawai', 'PPK', 'Direktur'] },
	{ name: 'Manajer Admin', path: '/admin', icon: Users, roles: ['Super Admin'] },
	{ name: 'Sistem Template', path: '/templates', icon: FileSignature, roles: ['Super Admin'] },
	{ name: 'Pengaturan Sistem', path: '/settings', icon: Settings, roles: ['Super Admin', 'Admin', 'Pegawai', 'PPK', 'Direktur'] }
];

export function getMenuForRole(role: string): RouteItem[] {
	if (!role) return [];
	return APP_ROUTES.filter((route) => route.roles.includes(role));
}
