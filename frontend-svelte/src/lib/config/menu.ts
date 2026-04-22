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
	{ name: 'Arsip Surat', path: '/arsip-surat', icon: Mail, roles: ['Super Admin', 'Admin'] },
	{ name: 'SPT', path: '/spt', icon: FileText, roles: ['Super Admin', 'Admin', 'Pegawai'] },
	{ name: 'SPTJM', path: '/sptjm', icon: CheckSquare, roles: ['Super Admin', 'PPK'] },
	{ name: 'SPJ & Kwitansi', path: '/spj', icon: Receipt, roles: ['Super Admin', 'Admin'] },
	{ name: 'Template DOCX', path: '/templates', icon: FileSignature, roles: ['Super Admin', 'Admin'] },
	{ name: 'Data Pegawai', path: '/pegawai', icon: Users, roles: ['Super Admin'] },
	{ name: 'Daftar Admin', path: '/admin', icon: Users, roles: ['Super Admin'] },
	{ name: 'Pengaturan SBM', path: '/sbm', icon: Settings, roles: ['Super Admin'] },
	{ name: 'Pengaturan Umum', path: '/settings', icon: Settings, roles: ['Super Admin'] }
];

export function getMenuForRole(role: string): RouteItem[] {
	if (!role) return [];
	return APP_ROUTES.filter((route) => route.roles.includes(role));
}
