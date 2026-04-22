export class AppState {
	// Sidebar state
	isSidebarOpen = $state(false);

	toggleSidebar() {
		this.isSidebarOpen = !this.isSidebarOpen;
	}

	closeSidebar() {
		this.isSidebarOpen = false;
	}

	openSidebar() {
		this.isSidebarOpen = true;
	}
}

export const appState = new AppState();
