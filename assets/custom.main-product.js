function setMainProductScripts(loadedInCollection = false) {
    if (loadedInCollection) {
      let productModalContainer = document.querySelector('.product-modal__container');
      productModalContainer.scrollTop = 0;
    }

        /* Product Info Scroll */
        let currentScrollPosition = 0;
        let lastScrollPosition = 0;
        let currentScrollPositionCollection = 0;
        let lastScrollPositionCollection = 0;
        function listenerProductScroll() {
            const productScrolling = document.querySelector('[data-scrolling-item]');
            const productInfoWrapper = document.querySelector('.product__info-wrapper[data-info-wrapper]');
        
            if (!productScrolling) return;
            // if (window.innerWidth >= 1025) {
            //   function productScrollSwitcher(currentScrollPosition, lastScrollPosition) {
            //     if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 500) {
      
            //       if (!activeTabs) {
            //         productScrolling.classList.add('scrolling-down');
            //         productScrolling.classList.remove('scrolling-up');
            //       }
            //     } else {
            //       productScrolling.classList.remove('scrolling-down');
            //       productScrolling.classList.add('scrolling-up');
            //     }
            //   }
      
            //   if (loadedInCollection) {
            //     let productModalContainer = document.querySelector('.product-modal__container');
            //     productModalContainer.addEventListener('scroll', () => {
            //       currentScrollPositionCollection = productModalContainer.scrollTop;
            //       productScrollSwitcher(currentScrollPositionCollection, lastScrollPositionCollection);
            //       lastScrollPositionCollection = currentScrollPositionCollection;
            //     });
            //   } else {
            //     currentScrollPosition = window.scrollY;
            //     if (currentScrollPosition > productInfoWrapper.offsetTop) return;
      
            //     productScrollSwitcher(currentScrollPosition, lastScrollPosition);
            //     lastScrollPosition = currentScrollPosition;
            //   }        
            // }
        }
      
        if(loadedInCollection) {
          listenerProductScroll();
        } else {
          window.addEventListener('scroll', listenerProductScroll);
          window.addEventListener('DOMContentLoaded', listenerProductScroll);
        }
      
  
    /* Accordion Tab */
    let activeTabs = false;
    function listenerAccordionTab() {
      const accordionTabs = document.querySelectorAll('[data-accordion-tab]');
      accordionTabs.forEach((accordionTab) => {
        accordionTab.addEventListener('click', (e) => {
          if(e.target.classList.contains('form__zip')) return;
          // toogle?
          accordionTab.classList.toggle('active');
          const accordionContent = accordionTab.querySelector('.accordion__content');
          if (accordionTab.classList.contains('active')) {
            accordionContent.classList.add('active');
          } else {
            accordionContent.classList.remove('active');
          }
  
          activeTabs = false;
  
          accordionTabs.forEach((tab) => {
            if (tab.classList.contains('active')) {
              activeTabs = true;
            }
          });
        });
      });
    }
    
    if(loadedInCollection) listenerAccordionTab();
    document.addEventListener('DOMContentLoaded', listenerAccordionTab);
  
    function displayNoneEmptyCollpasibleTabs() {
      const collapsibleTabs = document.querySelectorAll('[collapsible-tabs]');
      if (!collapsibleTabs) return;
  
      collapsibleTabs.forEach((collapsibleTab) => {
        const collpasibleContent = collapsibleTab.innerHTML.trim();
        if (collpasibleContent === '') {
          collapsibleTab.style.display = 'none';
        }
      });
    }
  
    if(loadedInCollection) displayNoneEmptyCollpasibleTabs();
    document.addEventListener('DOMContentLoaded', displayNoneEmptyCollpasibleTabs);
}
  
setMainProductScripts();

function variableLabelsClick() {
  const variableLabels = document.querySelectorAll('.product-form__input label');
  variableLabels.forEach((variableLabel) => {
    variableLabel.addEventListener('click', () => {
      const activeVariableLabel = document.querySelector('.product-form__input label.active');
      variableLabel.classList.toggle('active');
      if (activeVariableLabel && activeVariableLabel !== variableLabel) {
        activeVariableLabel.classList.remove('active');
      }
    });
  });
}

variableLabelsClick();



