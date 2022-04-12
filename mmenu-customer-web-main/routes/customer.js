const express = require('express');

const { getApiResponse, postApiResponse } = require('../utils/apiUtils');

const router = express.Router();

/* POST register */
router.post('/register', async (req, res) => {
  if (req.session.token) {
    res.send('failure');
  } else {
    req.session.token = req.body.jwtToken;
    req.session.userId = JSON.parse(req.body.user).id;
    res.send('success');
  }
});

const getSessionData = (req) => ({ token: req.session.token });

/* GET home page. */
router.get('/restaurants/:restaurantId/tables/:tableId/menus', async (req, res) => {
  const { restaurantId, tableId } = req.params;
  const shouldNotRegisterSession = !!req.session.token;
  let menuResponse;

  if (req.session.isNew) {
    res.render('menu');
  } else {
    if (Object.keys(req.query).length === 0) {
      // is empty
      menuResponse = await getApiResponse({
        url: `/restaurants/${restaurantId}/menus?status=available&searchName=&tableId=${tableId}`,
        method: 'GET',
        sessionData: getSessionData(req),
      });
    } else {
      menuResponse = await getApiResponse({
        url: `/restaurants/${restaurantId}/menus?status=available&searchName=${req.query.searchName}&tableId=${tableId}`,
        method: 'GET',
        sessionData: getSessionData(req),
      });
    }
    const cartResponse = await getApiResponse({
      url: `/restaurants/${restaurantId}/client/cart`,
      method: 'GET',
      sessionData: getSessionData(req),
    });

    res.render('menu', { menuInfo: menuResponse.result, cart: cartResponse.result, shouldNotRegisterSession });
  }
});

/* POST update menus page when pressing minus or plus */
router.post('/restaurants/:restaurantId/tables/:tableId/cart', async (req, res) => {
  const { restaurantId } = req.params;

  const cartResponse = await postApiResponse({
    url: `/restaurants/${restaurantId}/client/cart`,
    method: 'PATCH',
    body: JSON.stringify(req.body),
    sessionData: getSessionData(req),
  });
  if (cartResponse.code < 300) {
    res.send({ message: 'success', cartResponse });
  } else {
    res.send({ message: 'failure' });
  }
});

/* POST */
router.post('/restaurants/:restaurantId/tables/:tableId/cart', async (req, res) => {
  const { restaurantId } = req.params;

  await postApiResponse({
    url: `/restaurants/${restaurantId}/client/cart`,
    method: 'PATCH',
    body: JSON.stringify(req.body),
    sessionData: getSessionData(req),
  });
  res.send('success');
});

/* GET cart confirm page. */
router.get('/restaurants/:restaurantId/tables/:tableId/carts', async (req, res) => {
  const { restaurantId } = req.params;
  const shouldNotRegisterSession = !!req.session.token;

  if (req.session.isNew) {
    res.render('carts');
  } else {
    const cartResponse = await getApiResponse({
      url: `/restaurants/${restaurantId}/client/cart`,
      method: 'GET',
      sessionData: getSessionData(req),
    });

    res.render('carts', { cartConfirm: cartResponse.result, shouldNotRegisterSession });
  }
});

/* POST checkout from carts page */
router.post('/restaurants/:restaurantId/tables/:tableId/checkout', async (req, res) => {
  const { restaurantId, tableId } = req.params;

  // let data = {tableId: tableId};
  req.body.tableId = tableId;

  const cartResponse = await postApiResponse({
    url: `/restaurants/${restaurantId}/client/cart/checkout`,
    method: 'POST',
    body: JSON.stringify(req.body),
    sessionData: getSessionData(req),
  });

  res.send({
    code: cartResponse.code,
    message: cartResponse.message,
  });
});

/* GET dish info page. */
router.get('/restaurants/:restaurantId/tables/:tableId/dish/:dishId', async (req, res) => {
  const { restaurantId, tableId, dishId } = req.params;
  const shouldNotRegisterSession = !!req.session.token;

  if (req.session.isNew) {
    res.render('dish-info');
  } else {
    const menuResponse = await getApiResponse({
      url: `/restaurants/${restaurantId}/menus?status=available&searchName=&tableId=${tableId}`,
      method: 'GET',
      sessionData: getSessionData(req),
    });

    const cartResponse = await getApiResponse({
      url: `/restaurants/${restaurantId}/client/cart`,
      method: 'GET',
      sessionData: getSessionData(req),
    });

    const { cartItems } = cartResponse.result;

    // find the dish info
    let orderedDish = cartItems.filter((element) => element.dishId.id === dishId);
    let dishData;
    let quantity;
    let note;
    if (orderedDish.length === 0) {
      const { dishesMenu } = menuResponse.result;

      for (let i = 0; i < dishesMenu.length; i += 1) {
        orderedDish = dishesMenu[i].dishes.filter((element) => element.id === dishId);
        if (orderedDish.length !== 0) {
          [dishData] = orderedDish;
          quantity = 0;
        }
      }
    } else {
      dishData = orderedDish[0].dishId;
      quantity = orderedDish[0].quantity;
      note = orderedDish[0].note;
    }

    if(dishData.images.length != 0 && dishData.images[0] == "/app/assets/img/ic_warning_productcard_18only@2x.png?909d8e92875b02380b464d23f4e9d848"){
      dishData.images[0] = "/icons/default_dish.svg";
    }

    res.render('dish-info', { dishData, quantity, note, shouldNotRegisterSession });
  }
});

// /* POST  */
router.post('/restaurants/:restaurantId/tables/:tableId/dish/cart', async (req, res) => {
  const { restaurantId } = req.params;

  const cartResponse = await postApiResponse({
    url: `/restaurants/${restaurantId}/client/cart`,
    method: 'PATCH',
    body: JSON.stringify(req.body),
    sessionData: getSessionData(req),
  });
  res.send({data: cartResponse,status: 'success'});
});

/* GET topping page. */
router.get('/restaurants/:restaurantId/tables/:tableId/dish/:dishId/topping', async (req, res) => {
  // const { restaurantId, tableId } = req.params;

  res.render('dish-info-topping');
});

/* GET order-list page. */
router.get('/restaurants/:restaurantId/tables/:tableId/orders', async (req, res) => {
  const { restaurantId } = req.params;
  const shouldNotRegisterSession = !!req.session.token;

  if (req.session.isNew) {
    res.render('orders');
  } else {
    const orderResponse = await getApiResponse({
      url: `/restaurants/${restaurantId}/order-sessions?userId=${req.session.userId}`,
      method: 'get',
      sessionData: getSessionData(req),
    });

    if(Object.keys(orderResponse.result).length === 0 && orderResponse.result.constructor === Object){
      res.render('orders');
    }else{
      let orderSession;

      let ableToPay = 0;
      if (Object.prototype.hasOwnProperty.call(orderResponse.result, 'orderDetail')) {
        // if the order was not confirmed

        const tableIds = [orderResponse.result.orderDetail.tableId];

        orderSession = {
          orderDetails: [
            orderResponse.result.orderDetail,
          ],
          pretaxPaymentAmount: orderResponse.result.orderDetail.pretaxPaymentAmount,
          totalPoint: orderResponse.result.orderDetail.totalPoint,
          createdAt: orderResponse.result.orderDetail.createdAt,
          tableIds,
          representativeName: orderResponse.result.orderDetail.userId.name,
          representativePhone: orderResponse.result.orderDetail.userId.phone,
          numberOfCustomers: 1,
        };

        ableToPay = 0;
      } else {
        // if the order was confirmed
        orderSession = orderResponse.result.orderSession;
        orderSession.representativeName = orderResponse.result.orderSession.representativeId.name;
        orderSession.representativePhone = orderResponse.result.orderSession.representativeId.phone;
        ableToPay = 1;
      }

      res.render('orders', { orders: orderSession, ableToPay, shouldNotRegisterSession });
    }
  }
});

/* POST */
router.post('/restaurants/:restaurantId/tables/:tableId/order-details/:orderDetailId/dishorder-requests', async (req, res) => {
  const { restaurantId, orderDetailId } = req.params;

  await postApiResponse({
    url: `/restaurants/${restaurantId}/order-details/${orderDetailId}/dishorder-requests`,
    method: 'POST',
    body: JSON.stringify(req.body),
    sessionData: getSessionData(req),
  });
  res.send('success');
});

/* GET pay page. */
router.get('/restaurants/:restaurantId/tables/:tableId/orders/:orderSessionId/payment', async (req, res) => {
  const { restaurantId } = req.params;
  const shouldNotRegisterSession = !!req.session.token;

  if (req.session.isNew) {
    res.render('payment');
  } else {
    const orderPayment = await getApiResponse({
      url: `/restaurants/${restaurantId}/order-sessions?userId=${req.session.userId}`,
      method: 'get',
      sessionData: getSessionData(req),
    });

    // eslint-disable-next-line max-len
    orderPayment.result.orderSession.taxPaymentAmount = Math.round(orderPayment.result.orderSession.taxPaymentAmount);
    orderPayment.result.orderSession.discountAmount = Math.round(orderPayment.result.orderSession.discountAmount);
    orderPayment.result.orderSession.averagePaymentAmount = Math.round(orderPayment.result.orderSession.averagePaymentAmount);
    orderPayment.result.orderSession.paymentAmount = Math.round(orderPayment.result.orderSession.paymentAmount);

    res.render('payment', { orderSession: orderPayment.result.orderSession, shouldNotRegisterSession });
  }
});

/* POST add tip */
router.post('/restaurants/:restaurantId/tables/:tableId/orders/:orderDetailId/tip', async (req, res) => {
  const { restaurantId, orderDetailId } = req.params;

  const cartResponse = await postApiResponse({
    url: `/restaurants/${restaurantId}/order-sessions/${orderDetailId}`,
    method: 'PATCH',
    body: JSON.stringify(req.body),
    sessionData: getSessionData(req),
  });
  res.send(cartResponse);
});

/* GET pay-method page. */
router.get('/restaurants/:restaurantId/tables/:tableId/orders/:orderSessionId/payment-methods', async (req, res) => {
  // const { tableId, orderSessionId } = req.params;
  const shouldNotRegisterSession = !!req.session.token;
  if(req.session.isNew){
    res.render('payment-methods');
  } else {
    res.render('payment-methods', {shouldNotRegisterSession});
  }
});

/* GET history page */
router.get('/restaurants/:restaurantId/tables/:tableId/history', async(req, res, next) => {
  const shouldNotRegisterSession = !!req.session.token;
  if(req.session.isNew){
    res.render('history');
  } else {
    res.render('history', {shouldNotRegisterSession});
  }
});

/* PATCH pay request. */
router.post('/restaurants/:restaurantId/tables/:tableId/orders/:orderSessionId/payment-methods', async (req, res) => {
  const { restaurantId, orderSessionId } = req.params;

  let Response = await postApiResponse({
    url: `/restaurants/${restaurantId}/order-sessions/${orderSessionId}`,
    method: 'PATCH',
    body: JSON.stringify(req.body),
    sessionData: getSessionData(req),
  });

  if (Response.code < 300) {
    res.send({ message: 'success' });
  } else {
    res.send({ message: 'failure' });
  }
});

/* PATCH pay request. */
router.post('/restaurants/:restaurantId/tables/:tableId/orders/:orderSessionId/pay-request', async (req, res) => {
  const { restaurantId, orderSessionId } = req.params;

  let Response = await postApiResponse({
    url: `/restaurants/${restaurantId}/order-sessions/${orderSessionId}`,
    method: 'PATCH',
    body: JSON.stringify(req.body),
    sessionData: getSessionData(req),
  });

  if (Response.code < 300) {
    res.send({ message: 'success' });
  } else {
    res.send({ message: 'failure' });
  }
});

/* GET history page */
router.get('/restaurants/:restaurantId/tables/:tableId/orders/:orderSessionId/review', async(req, res,next) =>{
  const shouldNotRegisterSession = !!req.session.token;

  if(req.session.isNew){
    res.render('review');
  }else{
    res.render('review', {shouldNotRegisterSession});
  }
});

/* GET bill page */
router.get('/restaurants/:restaurantId/tables/:tableId/orders/:orderSessionId/bill', async(req, res,next) =>{
  const { restaurantId, orderSessionId } = req.params;
  const shouldNotRegisterSession = !!req.session.token;

  if(req.session.isNew){
    res.render('bill');
  }else{
    const orderPayment = await getApiResponse({
      url: `/restaurants/${restaurantId}/order-sessions/${orderSessionId}`,
      method: 'get',
      sessionData: getSessionData(req),
    });
    res.render( 'bill',{bill:orderPayment.result,shouldNotRegisterSession, taxPaymentAmount : Math.round(orderPayment.result.taxPaymentAmount) });
  }
});

/* GET history invoice page */
router.get('/restaurants/:restaurantId/orders/:orderSessionId/invoice', async(req, res,next) =>{
  const { restaurantId, orderSessionId } = req.params;
  const shouldNotRegisterSession = !!req.session.token;

  if(req.session.isNew){
    res.render('invoice');
  }else{
    const orderPayment = await getApiResponse({
      url: `/restaurants/${restaurantId}/order-sessions/${orderSessionId}`,
      method: 'get',
      sessionData: getSessionData(req),
    });

    res.render( 'invoice',{bill:orderPayment.result,shouldNotRegisterSession, taxPaymentAmount : Math.round(orderPayment.result.taxPaymentAmount) });
  }
});

module.exports = router;
