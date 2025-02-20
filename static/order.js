export function placeOrder1(orderInsure) {
  localStorage.setItem('orderInsure', JSON.stringify(orderInsure));
  console.log(orderInsure);
  window.location.href = '/order';
}

document.addEventListener('DOMContentLoaded', () => {
  const placeChOrButton = document.getElementById('placeChOrButton');
  const postOrder = document.getElementById('postOrder');
  if (placeChOrButton) {
      placeChOrButton.addEventListener('click', changeOrder);
      postOrder.addEventListener('click', postInDB);
  }
  const storedOrderInsure = JSON.parse(localStorage.getItem('orderInsure'));
  if (storedOrderInsure) {
      renderOrderInsure(storedOrderInsure);
  }
});

function postInDB(event) {
  event.preventDefault();

  let surname = document.getElementById("surname").value;
  let name = document.getElementById("name").value;
  let street = document.getElementById("street").value;
  let house = document.getElementById("house").value;
  let flat = document.getElementById("flat").value;
  let city = document.getElementById("city").value;
  let phone_number = document.getElementById("phone_number").value;
  const OrderInsure = JSON.parse(localStorage.getItem('orderInsure'));

  let orderData = {
      order: {
          "surname": surname,
          "name": name,
          "street": street,
          "house": house,
          "flat": flat,
          "city": city,
          "phone_number": phone_number
      },
      OrderInsure
  };

  const Http = new XMLHttpRequest();
  const url = 'http://127.0.0.1:5000/api/order';
  Http.open("POST", url);
  Http.setRequestHeader("Content-Type", "application/json");
  Http.send(JSON.stringify(orderData));

  Http.onload = () => {
      if (Http.status === 201) {
          alert('Заказ успешно оформлен!');
          localStorage.removeItem('orderInsure');
          localStorage.removeItem('cartData');
          window.location.href = '/';
      } else {
          alert('Ошибка при оформлении заказа.');
      }
  };
}

function changeOrder(event) {
  event.preventDefault();
  window.location.href = '/';
}

function renderOrderInsure(orderInsure) {
  const checkForm = document.getElementById('check-form');
  let totalPrice = 0;
  orderInsure.forEach(item => {
      const p = document.createElement('p');
      p.textContent = `${item.name} - ${item.price}р.`;
      totalPrice += Number(item.price);
      checkForm.insertBefore(p, checkForm.firstChild);
  });
  document.getElementById('total2').textContent = totalPrice;
}