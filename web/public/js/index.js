document.addEventListener('DOMContentLoaded', () => {
  const topAppBar = new mdc.topAppBar.MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
  const topAppBarNavigation = document.querySelector('.mdc-top-app-bar__navigation-icon');

  const drawerPersistent = window.innerWidth > 825;
  const drawerElement = document.querySelector('.mdc-drawer');
  const drawerCssClass = drawerPersistent ? 'mdc-drawer--persistent' : 'mdc-drawer--temporary';
  const drawerClass = drawerPersistent ? mdc.drawer.MDCPersistentDrawer : mdc.drawer.MDCTemporaryDrawer;
  drawerElement.classList.add(drawerCssClass);
  const drawer = new drawerClass(drawerElement);
  if (drawerPersistent) {
    drawer.open = drawerPersistent;
  }

  topAppBarNavigation.addEventListener('click', event => {
    event.preventDefault();
    drawer.open = !drawer.open;
  });
});
