

function menuClose() { //closes mobile menu
  $('.mobile-nav span, .mobile-nav span:before, .mobile-nav span:after').removeClass('open');
  setTimeout(function() {
    $('.mobile-nav span, .mobile-nav span:before, .mobile-nav span:after').removeClass('open');
  }, 10);
$('.mobile').removeClass('navopen');
};

function menuOpen() { //opens mobile menu
  $('.mobile-nav span, .mobile-nav span:before, .mobile-nav span:after').addClass('open');
  setTimeout(function() {
    $('.mobile-nav span, .mobile-nav span:before, .mobile-nav span:after').addClass('open');
  }, 150);
  $('.mobile').addClass('navopen');
};

$('.mobile-nav').click(function() { //controls mobile menu behavior based on menu click event
  if ($('.mobile-nav span, .mobile-nav span:before, .mobile-nav span:after').hasClass('open')) {
    menuClose();
  } else {
    menuOpen();
  }
});









$(document).ready(function() {
  $('.owl-carousel').owlCarousel({
    margin: 10,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
        nav: true
      },
      600: {
        items: 2,
        nav: true
      },
      1000: {
        items: 4,
        nav: true,
        margin: 20
      }
    }
  })
})


window.addEventListener('scroll', function(e) {
  const pixelToTopQuantity = 100;

  const tabsArray = document.querySelectorAll('.scroll-to');
  const menusArray = document.querySelectorAll('.releases__row');
  const clientBrowserWidth = document.documentElement.clientWidth;

  if (clientBrowserWidth >= 769) {
    menusArray.forEach(item => {
      let distanceToTop = item.getBoundingClientRect().top;
  
      if (distanceToTop <= pixelToTopQuantity) {
        if (item.id === 'menu-1') {
          tabsArray[0].classList.add('tabs--active');
        } else if (item.id === 'menu-2') {
          tabsArray[0].classList.remove('tabs--active');
          tabsArray[1].classList.add('tabs--active');
        } else if (item.id === 'menu-3') {
          tabsArray[1].classList.remove('tabs--active');
          tabsArray[2].classList.add('tabs--active');
        }
      } else if (distanceToTop >= pixelToTopQuantity) {
        if (item.id === 'menu-1') {
          tabsArray[0].classList.remove('tabs--active');
        } else if (item.id === 'menu-2') {
          tabsArray[1].classList.remove('tabs--active');
        } else if (item.id === 'menu-3') {
          tabsArray[2].classList.remove('tabs--active');
        }
      }
    });
  }
});
