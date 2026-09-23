function megaMenuListener() {
    const megaMenuList = document.querySelectorAll('.mega-menu__content');
    megaMenuList.forEach(megaMenu => {
        megaMenu.addEventListener('mouseout', (e) => {
            if (e.relatedTarget.closest('.mega-menu__content')) return;
            const parentMegaMenu = e.target.closest('.mega-menu');
            parentMegaMenu.removeAttribute('open');

        });
    })
}

document.addEventListener('DOMContentLoaded', () => {
    megaMenuListener();
})