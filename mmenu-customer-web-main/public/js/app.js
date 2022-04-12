/* eslint-disable no-undef*/
const dishWidth = 196;
const dishSpace = 20;
const baseUrl = 'https://devapi.mmenu.io/v1';

$(document).ready(() => {
  initOnLoad();

  $(document).on('click', '#btn-menu-main', (e) => {
    document.getElementById('sidenav-right').style.width = '252px';
  });

  // $(document).on('click', '#side-nav-history', function (e) {
  //   e.preventDefault();
  //   const pathArray = window.location.href.replace(/(customer).*/, '$1');
  //   window.location.href = (pathArray+'/history');
  // });


  $(document).on('click', '#sidenav-right .closebtn', function (e) {
    document.getElementById("sidenav-right").style.width = "0";
  });

  $(document).on('click', '.menu-item.group', function (e) {
    e.preventDefault();
    const subMenus = this.nextElementSibling;
    $(subMenus).toggleClass('show');
    $(this).toggleClass('show');
    const isShow = $(subMenus).hasClass('show');
    const arrow_icon = $(this).find('img.arrow');
    arrow_icon.attr('src', `/icons/arrow-${isShow ? 'down' : 'left'}.svg`);
    arrow_icon.css('top', isShow ? '18px' : '12px');
  });

  $(document).on('show.bs.modal', '#modal-danhmuc', () => {
    $('.cb-danh-muc').addClass('show');
  });

  $(document).on('hide.bs.modal', '#modal-danhmuc', () => {
    $('.cb-danh-muc').removeClass('show');
  });
  $(document).on('click', '#modal-danhmuc .menu-item', function (e) {
    e.preventDefault();

    // change active item
    $(this).parent().children('.menu-item').removeClass('active');
    $(this).addClass('active');

    // set the selected value to cb-danh-muc
    const selectedText = $(this).text();
    const selectedKey = $(this).attr('href').substring(1);
    const cb = $('#main-filter .cb-danh-muc>.value');
    cb.html(selectedText);
    cb.attr('key', selectedKey);

    // hide the menu
    $('#modal-danhmuc').modal('hide');
  });

  $(document).on('click', '.slider .slider-nav', function (e) {
    const navs = $(this).parent().children('.slider-nav');
    navs.removeClass('active');
    $(this).addClass('active');
    const index = $(this).index();

    let left = index * (dishWidth + dishSpace);
    if (index > 0) left -= (dishWidth - dishSpace) / 2;
    // slider-items
    const slider_items = $(this).closest('.slider').find('.slider-items');
    $(slider_items[0]).css('margin-left', `-${left}px`);
  });
  $(document).on('click', '.img-slider .slider-nav', function (e) {
    const navs = $(this).parent().children('.slider-nav');
    navs.removeClass('active');
    $(this).addClass('active');
    const index = $(this).index();

    const imgs = $(this).closest('.img-slider').find('.imgs>img');
    imgs.css('opacity', 0.3); // animation
    setTimeout(() => {
      imgs.removeClass('active');
      $(imgs[index]).addClass('active').css('opacity', 1);
    }, 200);
  });
  $(document).on('click', '.dish-info .dish-options .option-item .text', function (e) {
    const chk = $(this).parent().find('input');
    chk.prop('checked', !chk.prop('checked'));
  });

  let slider_touchstart_x;
  let touchstart_margin;
  let sliding_item;
  let slider_last_dx;
  $(document).on('touchstart', '.slider>*', function (e) {
    slider_last_dx = undefined;
    slider_touchstart_x = e.touches[0].screenX;
    sliding_item = $(this).closest('.slider').find('.slider-items')[0];
    touchstart_margin = $(sliding_item).css('margin-left');
    touchstart_margin = touchstart_margin.replace('px', '');
    touchstart_margin = parseInt(touchstart_margin);
    if (!touchstart_margin) touchstart_margin = 0;
  });
  $(document).on('touchmove', '.slider>*', (e) => {
    slider_last_dx = e.touches[0].screenX - slider_touchstart_x;
    let margin = touchstart_margin + 4 * slider_last_dx;
    if (margin > dishWidth / 2) margin = dishWidth / 2;
    $(sliding_item).css('margin-left', `${margin}px`);
  });
  $(document).on('touchend', '.slider>*', function (e) {
    if (!slider_last_dx || Math.abs(slider_last_dx) < 50) return;
    const activeItems = $(this).closest('.slider').find('.slider-nav.active');
    const activeItem = $(activeItems[0]);
    let activeIndex = activeItem.index();

    const nextItem = (slider_last_dx < 0) ? activeItem.next() : activeItem.prev();
    if (nextItem) {
      activeIndex += (slider_last_dx < 0) ? 1 : -1;
    }

    const items = $(this).closest('.slider').find('.slider-nav');
    if (activeIndex < 0) activeIndex = 0;
    if (activeIndex >= items.length) activeIndex = items.length - 1;
    $(items[activeIndex]).click();
  });
  $(document).on('touchstart', '.img-slider img', (e) => {
    slider_last_dx = undefined;
    slider_touchstart_x = e.touches[0].screenX;
  });
  $(document).on('touchmove', '.img-slider img', (e) => {
    slider_last_dx = e.touches[0].screenX - slider_touchstart_x;
  });
  $(document).on('touchend', '.img-slider img', function (e) {
    if (!slider_last_dx || Math.abs(slider_last_dx) < 50) return;
    const activeItems = $(this).closest('.img-slider').find('.imgs>.active');
    const activeItem = $(activeItems[0]);
    let activeIndex = activeItem.index();
    const nextItem = (slider_last_dx < 0) ? activeItem.next() : activeItem.prev();
    if (nextItem) {
      activeIndex += (slider_last_dx < 0) ? 1 : -1;
    }
    const items = $(this).closest('.img-slider').find('.slider-nav');
    if (activeIndex < 0) activeIndex = 0;
    if (activeIndex >= items.length) activeIndex = items.length - 1;
    $(items[activeIndex]).click();
  });

  $(document).on('click', '.dish-amount-order-list img', function (e) {
    e.preventDefault();
    const isPlus = $(this).hasClass('plus');
    const isMinus = $(this).hasClass('minus');
    if (!isPlus && !isMinus) return;

    let eleDish = $(this).closest('.dish');
    if (!eleDish?.length) eleDish = $(this).closest('.dish-info');

    // Amount
    const eleAmount = $(eleDish).find('.amount');
    let amount = eleAmount.text();
    amount = parseInt(amount);
    const newAmount = amount += isPlus ? 1 : -1;
    if (amount < 0) amount = 0;
    eleAmount.html(amount);

    if (changeIn_modal_edit_order_dish_item(eleDish, amount)) return;

    // Price
    const elePrice = $(eleDish).find('.price');
    if (!elePrice) return;
    let price = elePrice.text();
    price = price.replace('đ', '').replaceAll(',', '').replaceAll('.', '');
    price = parseInt(price);
    $.ajax({
      type: 'POST',
      url: 'cart',
      data: { dishId: this.getAttribute('dishId'), quantity: newAmount },
      success(data) {
        if (data === 'success') {
          amount = newAmount;
          if (amount < 0) amount = 0;
          eleAmount.html(amount);
        }
      },
    });
  });

  $(document).on('click', '.dish-amount-info img', function (e) {
    e.preventDefault();
    const isPlus = $(this).hasClass('plus');
    const isMinus = $(this).hasClass('minus');
    if (!isPlus && !isMinus) return;

    let eleDish = $(this).closest('.dish');
    if (!eleDish?.length) eleDish = $(this).closest('.dish-info');

    // Amount
    const eleAmount = $(eleDish).find('.amount');
    let amount = eleAmount.text();
    amount = parseInt(amount);
    amount += isPlus ? 1 : -1;
    if (amount < 0) amount = 0;
    eleAmount.html(amount);

    if (changeIn_modal_edit_order_dish_item(eleDish, amount)) return;

    // Price
    const elePrice = $(eleDish).find('.price');
    if (!elePrice) return;
    let price = elePrice.text();
    price = price.replace('đ', '').replaceAll(',', '').replaceAll('.', '');
    price = parseInt(price);
  });

  // dish info page
  $(document).on('click', '.btn-datmon-dish', function (e) {
    e.preventDefault();

    const eleAmount = $(document).find('.amount');
    const eleGhiChu = $(document).find('.input-note');
    const amount = parseInt(eleAmount.text());
    if (eleGhiChu.val() === '') {
      $.post(
        'cart',
        {
          dishId: this.getAttribute('dishId'),
          quantity: amount,
        },
        (data, status) => {
          document.referrer ? window.location = document.referrer : history.back();
        },
      );
    } else {
      $.post(
        'cart',
        {
          dishId: this.getAttribute('dishId'),
          quantity: amount,
          note: eleGhiChu.val(),
        },
        (data, status) => {
          document.referrer ? window.location = document.referrer : history.back();
        },
      );
    }
  });

  $(document).on('click', '.page-order-list .dish-item .btn-edit', function (e) {
    const dish = $(this).closest('.dish-item');
    const dishId = dish.attr('item-id');

    const modal = $('#modal-edit-order-dish-item');
    modal.modal(); // show the modal
    modal.attr('item-id', dishId); // set the ID of editing dish
    //  modal.find('.dish-text>.title').html(...title...); // set the title/name of editing dish
  });

  $(document).on('click', '#modal-chon-tieu-diem .cb-nguoi-tieu-diem', (e) => {
    $('#modal-list-nguoi-tieu-diem').modal();
  });
  $(document).on('show.bs.modal', '#modal-list-nguoi-tieu-diem', () => {
    $('#modal-chon-tieu-diem').css('z-index', 1039);
  });
  $(document).on('hide.bs.modal', '#modal-list-nguoi-tieu-diem', () => {
    $('#modal-chon-tieu-diem').css('z-index', 1050);
  });
  $(document).on('click', '#modal-list-nguoi-tieu-diem .nguoi-tieu-diem-item', function (e) {
    e.preventDefault();
    const seletedText = $(this).text();
    $('#modal-chon-tieu-diem .cb-nguoi-tieu-diem>.value').html(seletedText);
    $('#modal-list-nguoi-tieu-diem').modal('hide');
  });

  $(document).on('click', '#modal-tip-nv .tipval', function (e) {
    e.preventDefault();

    $(document).find('.tbx-tipval').find('input').val('');
    $(this).parent().children('.tipval').removeClass('active');
    $(this).addClass('active');
  });

  $(document).on('click', '.menu-item', function (e) {
    const attr = $(this).attr('categoryid');

    // For some browsers, `attr` is undefined; for others, `attr` is false. Check for both.
    if (typeof attr !== typeof undefined && attr !== false) {
    // Element has this attribute
      const tempUrl = window.location.href.replace(/(menus).*/, '$1');
      window.location.replace(`${tempUrl}#${this.getAttribute('categoryId')}`);
    }
  });

  // button back
  $(document).on('click', '#btn-back', (e) => {
    // back one page and refresh that page
    document.referrer ? window.location = document.referrer : history.back();
  });
});

function changeIn_modal_edit_order_dish_item(dish, changedAmount) {
  const modal = dish.closest('.modal');
  if (!modal?.length) return false;
  const modalId = modal.prop('id');
  if (modalId != 'modal-edit-order-dish-item') return false;
  const btnOK = modal.find('.btn-ok');
  if (!btnOK?.length) return false;
  btnOK.html((changedAmount && changedAmount > 0) ? 'Sửa' : 'Hủy');
  return true;
}

async function initOnLoad() {
  const user = JSON.parse(window.localStorage.getItem('user'));
  if (!user || !user.id) {
    shouldNotRegisterSession = false;
    await $.ajax({
      type: 'POST',
      url: `${baseUrl}/users/anonymous`,
      success(data) {
        const response = data;
        if (response.code < 300) {
          window.localStorage.setItem('user', JSON.stringify(response.result.user));
          window.localStorage.setItem('jwtToken', response.result.access_token.token);
        }
      },
    });
  }
  if (shouldNotRegisterSession == "1") {
    return;
  }
  const tempUrl = window.location.href.replace(/(customer).*/, '$1');
  await $.ajax({
    type: 'POST',
    url: '/customer/register',
    data: {
      user: window.localStorage.getItem('user'),
      jwtToken: window.localStorage.getItem('jwtToken'),
    },
    success(data) {
      if (data === 'success') {
        location.reload(true);
      }
    },
  });
}
