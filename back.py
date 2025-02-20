from flask import Flask, jsonify, request, render_template, send_from_directory, session
import psycopg2
import base64


app = Flask(__name__)
app.config['SECRET_KEY'] = 'a3KD92pZMf_xOvh9w9RaMs5pQ6JeRo1KZftuqEUOToM'
app.config['DEBUG'] = True


def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="7393"
    )
    return conn


@app.route('/current_user', methods=['GET'])
def get_current_user():
    if 'user' in session:
        return jsonify({
            "login": session['user']['login'],
            "role": session['user']['role']
        }), 200
    return jsonify({"message": "Пользователь не вошел в систему"}), 401

@app.route('/')
def serve_index():
    return render_template('main.html')


@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)


@app.route('/showcase', methods=['GET', 'POST'])
def serve_main():
    return render_template('main.html')


@app.route('/auth', methods=['GET', 'POST'])
def auth():
    return render_template('index.html')


@app.route('/map', methods=['GET', 'POST'])
def maps():
    return render_template('otsle.html')


@app.route('/admin/dashboard', methods=['GET', 'POST'])
def dashboard():
    if session['user']['role'] == 1:
        return render_template('index.html')
    else:
        return render_template('admin_panel.html')


@app.route('/admin/add_pizza', methods=['GET', 'POST'])
def add_pizza():
    if session['user']['role'] == 1:
        return render_template('index.html')
    else:
        return render_template('add_pizza.html')


@app.route('/admin/add_user', methods=['GET', 'POST'])
def add_user():
    if session['user']['role'] == 1:
        return render_template('index.html')
    else:
        return render_template('add_user.html')


@app.route('/admin/view_orders', methods=['GET', 'POST'])
def view_orders():
    if session['user']['role'] == 1:
        return render_template('index.html')
    else:
        return render_template('orders.html')


@app.route('/order', methods=['GET', 'POST'])
def order():
    return render_template('order.html')


@app.route('/own_orders', methods=['GET', 'POST'])
def own_orders():
    return render_template('own_orders.html')


@app.route('/api/add_user', methods=['POST'])
def api_add_user():
    login = request.form['login'].strip().lower()
    password = request.form['password'].strip().lower()
    role = request.form['role']
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute('SELECT id_user FROM users ORDER BY id_user DESC LIMIT 1')
        last_id_row = cur.fetchone()
        last_id = last_id_row[0] if last_id_row else 0
        new_id = last_id + 1

        cur.execute(
            'INSERT INTO users (id_user, login, password, role) VALUES (%s, %s, %s, %s)',
            (new_id, login, password, role)
        )
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'message': 'Пользователь успешно добавлен!'}), 201

    except Exception as e:
        print(f"Ошибка: {e}")
        return jsonify({'error': 'Ошибка при добавлении пользователя.'}), 500


@app.route('/api/own_orders', methods=['GET'])
def api_own_orders():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cursor = conn.cursor()

    userId = session['user']['login']
    cursor.execute(f"SELECT id_user FROM public.users WHERE login = '{userId}';")

    user_id = cursor.fetchone()[0]

    cursor.execute("""
        SELECT id_order
        FROM public."order-user"
        WHERE id_user = '%s';
    """, (user_id,))

    orders = cursor.fetchall()

    orders_list = []
    for order_id in orders:
        cursor.execute("""
            SELECT surname, name, street, house, flat, city, phone_number, id_order, condition
            FROM public.orders
            WHERE id_order = %s;
        """, (order_id,))

        order = cursor.fetchone()
        if order is None:
            continue

        cursor.execute("""
            SELECT oc.id_order_com, p.name as pizza_name, p.price
            FROM public.order_composition oc
            JOIN public.pizza p ON oc.id_pizza = p.id_pizza
            WHERE oc.id_order = %s;
        """, (order[7],))

        pizzas = cursor.fetchall()

        order_with_pizzas = {
            "surname": order[0],
            "name": order[1],
            "street": order[2],
            "house": order[3],
            "flat": order[4],
            "city": order[5],
            "phone_number": order[6],
            "id_order": order[7],
            "condition": order[8],
            "pizzas": [{
                "id_order_com": pizza[0],
                "pizza_name": pizza[1],
                "price": float(pizza[2])
            } for pizza in pizzas]
        }

        orders_list.append(order_with_pizzas)

    cursor.close()
    conn.close()

    return jsonify(orders_list), 200


@app.route('/order')
def serve_order():
    return render_template('order.html')


@app.route('/authenticate', methods=['POST'])
def authenticate():
    data = request.get_json()
    login = data.get('login')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password, role FROM users WHERE login = %s", (login,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and user[0] == password:
        session['user'] = {"login": login, "role": user[1]}
        return jsonify({"message": "Аутентификация прошла успешно"}), 200
    else:
        return jsonify({"message": "Неверное имя пользователя или пароль"}), 401


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"message": "Вышел из системы"}), 200


courier_location = {
    "latitude": None,
    "longitude": None,
    "courier_id": None
}


@app.route('/api/update_location', methods=['POST'])
def update_location():
    data = request.get_json()

    latitude = data.get('latitude')
    longitude = data.get('longitude')
    courier_id = data.get('courier_id')
    courier_location['latitude'] = latitude
    courier_location['longitude'] = longitude
    courier_location['courier_id'] = courier_id

    # Здесь можно добавить код для сохранения местоположения курьера в базу данных или выполнения других операций

    return jsonify({"message": "Location updated successfully"}), 200


@app.route('/api/get_location', methods=['GET'])
def get_location():
    # Получаем данные о местоположении курьера для GET запроса
    if courier_location['latitude'] is not None and courier_location['longitude'] is not None:
        return jsonify({
            "latitude": courier_location['latitude'],
            "longitude": courier_location['longitude'],
            "courier_id": courier_location['courier_id']
        }), 200
    else:
        return jsonify({"message": "Courier location not available"}), 404


@app.route('/registration', methods=['POST'])
def registration():
    try:
        data = request.get_json()
        login = data.get('login')
        password = data.get('password')
        role = 3

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id_user FROM public.users ORDER BY id_user DESC LIMIT 1")
        id_user = int(cursor.fetchone()[0]) + 1
        cursor.execute("INSERT INTO users (id_user, login, password, role) VALUES (%s, %s, %s, %s)",
                       (id_user, login, password, role))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Successful registration"}), 201
    except psycopg2.errors.UniqueViolation:
        return jsonify({"message": "Этот логин уже используется", "error": "logVal"}), 400


@app.route('/api/courier/<login>', methods=['GET'])
def get_courier(login):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT surname, name, patronimic FROM users2 WHERE login = %s", (login,))
    courier = cursor.fetchone()
    cursor.close()
    conn.close()

    if courier:
        return jsonify({
            "surname": courier[0],
            "name": courier[1],
            "patronimic": courier[2]
        })
    else:
        return jsonify({"error": "Courier not found"}), 404


@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
            SELECT surname, name, street, house, flat, city, phone_number, id_order, condition
            FROM orders
        """)
    orders = cursor.fetchall()

    orders_list = []
    for order in orders:
        cursor.execute("""
                SELECT oc.id_order_com, p.name as pizza_name, p.price
                FROM order_composition oc
                JOIN pizza p ON oc.id_pizza = p.id_pizza
                WHERE oc.id_order = %s;
            """, (order[7],))

        pizzas = cursor.fetchall()

        order_with_pizzas = {
            "surname": order[0],
            "name": order[1],
            "street": order[2],
            "house": order[3],
            "flat": order[4],
            "city": order[5],
            "phone_number": order[6],
            "id_order": order[7],
            "condition": order[8],
            "pizzas": [{
                "id_order_com": pizza[0],
                "pizza_name": pizza[1],
                "price": float(pizza[2])
            } for pizza in pizzas]
        }

        orders_list.append(order_with_pizzas)

    cursor.close()
    conn.close()

    return jsonify(orders_list)


@app.route('/api/add_pizzas', methods=['POST'])
def add_pizzas():
    conn = get_db_connection()
    cursor = conn.cursor()

    name = request.form['name']
    price = request.form['price']
    image = request.files['image']

    if image:
        image_bytes = image.read()
    else:
        return jsonify({'error': 'Файл изображения не предоставлен'}), 400

    try:
        cursor.execute("SELECT id_pizza FROM public.pizza ORDER BY id_pizza DESC LIMIT 1")
        id_pizza = int(cursor.fetchone()[0]) + 1
        cursor.execute("INSERT INTO public.pizza (id_pizza, name, price, image) VALUES (%s, %s, %s, %s)",
                       (id_pizza, name, price, psycopg2.Binary(image_bytes)))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Пицца успешно добавлена'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get('status')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET condition = %s WHERE id_order = %s", (new_status, order_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"success": True})


@app.route('/api/pizzas', methods=['GET'])
def get_pizzas():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id_pizza, name, price, image FROM public.pizza")
    pizzas = cursor.fetchall()
    pizza_list = []

    for pizza in pizzas:
        if pizza[3] is not None:
            image_base64 = base64.b64encode(pizza[3]).decode('utf-8')
        else:
            image_base64 = None
        pizza_list.append({
            "id_pizza": pizza[0],
            "name": pizza[1],
            "price": pizza[2],
            "image": image_base64
        })

    cursor.close()
    conn.close()
    return jsonify(pizza_list)


@app.route('/api/order', methods=['POST'])
def new_orders():
    conn = get_db_connection()
    cursor = conn.cursor()

    data = request.get_json()
    surname = data.get('order')['surname']
    name = data.get('order')['name']
    street = data.get('order')['street']
    house = data.get('order')['house']
    flat = data.get('order')['flat']
    city = data.get('order')['city']
    phone_number = data.get('order')['phone_number']
    condition = 'В обработке'

    cursor.execute("SELECT id_order FROM public.orders ORDER BY id_order DESC LIMIT 1")
    id_order = int(cursor.fetchone()[0]) + 1
    pizza_ever = data.get('OrderInsure')
    cursor.execute("INSERT INTO public.orders(surname, name, street, house, flat, city, phone_number, id_order, condition) "
                   "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
                   "RETURNING id_order;",
                   (surname, name, street, house, flat, city, phone_number, id_order, condition))

    new_order_id = cursor.fetchone()[0]

    try:
        if session['user']:
            userId = session['user']['login']
            cursor.execute(f"SELECT id_user FROM public.users WHERE login = '{userId}';")

            user_id = cursor.fetchone()[0]
            cursor.execute("""
                INSERT INTO public."order-user"(id_user, id_order)
                VALUES (%s, %s);
            """, (user_id, new_order_id))
    except:
        pass

    conn.commit()
    g = 0
    for i in pizza_ever:
        cursor.execute("SELECT id_order_com FROM public.order_composition ORDER BY id_order_com DESC LIMIT 1")
        id_order_com = int(cursor.fetchone()[0]) + 1
        cursor.execute("INSERT INTO public.order_composition(id_order_com, id_pizza, id_order) VALUES (%s, %s, %s)",
                       (id_order_com, pizza_ever[g]['id_pizza'], id_order))
        g += 1
        conn.commit()

    conn.commit()
    cursor.close()
    conn.close()
    return "", 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
