document.addEventListener('DOMContentLoaded', () => {
  const topAppBar = new mdc.topAppBar.MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
  const drawer = new mdc.drawer.MDCPersistentDrawer(document.querySelector('.mdc-drawer'));
  const topAppBarNavitaion = document.querySelector('.mdc-top-app-bar__navigation-icon');

  topAppBarNavitaion.addEventListener('click', event => {
    event.preventDefault();
    drawer.open = !drawer.open;
  });
});
