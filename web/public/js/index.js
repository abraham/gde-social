firebase.initializeApp({
  apiKey: 'AIzaSyAU4-i_qfd6IHSTu_Z3hdRoGKRsoRUtLvc',
  authDomain: 'gde-social.firebaseapp.com',
  projectId: 'gde-social',
});

const db = firebase.firestore();

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

  const btn = new LoadMore(document.querySelector('#load-more'));
  document.querySelector('#load-more').addEventListener('click', () => btn.loadNext());
});

function renderStatus(status) {
  const ts = document.createElement('twitter-status');
  ts.status = status;
  document.querySelector('#statuses').append(ts);
}

class LoadMore {
  constructor(element) {
    this._btn = element;
    this.btn.disabled = false;
  }

  get btn() {
    return this._btn;
  }

  set text(text) {
    this.btn.innerText = text;
  }

  set loading(active) {
    if (active) {
      this.btn.disabled = true;
      this.text = 'Loading...';
    } else {
      this.btn.disabled = false;
      this.text = 'Load more';
    }
  }

  async loadNext() {
    if (this.btn.disabled) {
      return;
    }
    this.loading = true;
    const statuses = await this.statuses(this.route);
    statuses.forEach(status => {
      renderStatus(JSON.parse(status.data));
    });
    if (statuses.length > 0) {
      this.oldestCreatedAt = statuses[statuses.length - 1].createdAt;
      this.loading = false;
    } else {
      this.text = 'No more results';
    }
  }

  get oldestCreatedAt() {
    return Number(this.btn.dataset.oldestCreatedAt);
  }

  get route() {
    return this.btn.dataset.route;
  }

  set oldestCreatedAt(createdAt) {
    return this.btn.dataset.oldestCreatedAt = createdAt;
  }

  async statuses(route) {
    let query = db.collection('statuses').limit(25);

    if (route === 'index') {
      query = query.orderBy('createdAt', 'desc')
        .startAfter(this.oldestCreatedAt);
    } else if (route === 'links') {
      debugger;
      query = query.orderBy('createdAt', 'desc')
        .where('hasLinks', '==', true)
        .startAfter(this.oldestCreatedAt);
    } else {

      query = query.where(`hashtags.${route}`, '>', 0)
        .orderBy(`hashtags.${route}`, 'desc')
        .startAfter(this.oldestCreatedAt);
    }

    const snaps = await query.get();
    return snaps.docs.map(snap => snap.data());
  }
}
