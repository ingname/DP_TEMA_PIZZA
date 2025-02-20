document.addEventListener('DOMContentLoaded', () => {
    const buttonSignUp = document.getElementById('button-sign-up');
    const buttonRegister = document.getElementById('button-reg');
    if (buttonSignUp) {
        buttonSignUp.addEventListener('click', signUpIn);
    }
    if (buttonRegister) {
        buttonRegister.addEventListener('click', registration);
    }
});

const container = document.querySelector(".container"),
      pwShowHide = document.querySelectorAll(".showHidePw"),
      pwFields = document.querySelectorAll(".password"),
      signUp = document.querySelector(".signup-link"),
      login = document.querySelector(".login-link");

pwShowHide.forEach(eyeIcon => {
    eyeIcon.addEventListener("click", () => {
        pwFields.forEach(pwField => {
            if (pwField.type === "password") {
                pwField.type = "text";
                pwShowHide.forEach(icon => {
                    icon.classList.replace("uil-eye-slash", "uil-eye");
                });
            } else {
                pwField.type = "password";
                pwShowHide.forEach(icon => {
                    icon.classList.replace("uil-eye", "uil-eye-slash");
                });
            }
        });
    });
});

function cleanInput(input) {
    return input.trim().toLowerCase();
}

function loadShowcase() {
    fetch('http://127.0.0.1:5000/showcase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.text())
    .then(html => {
        document.open();
        document.write(html);
        document.close();
    })
    .catch(error => {
        console.error('Error loading showcase:', error);
    });
}

function signUpIn() {
    try {
        let loginInp = cleanInput(document.getElementById("loginInp").value),
            passwInp = cleanInput(document.getElementById('passwInp').value);

        if (loginInp === '' || passwInp === '') {
            let textAboutErr = document.getElementById('incorrIpt');
            textAboutErr.textContent = 'Вы не ввели данные';
        } else {
            let textAboutErr = document.getElementById('incorrIpt');
            textAboutErr.textContent = '';

            let authData = {
                'login': loginInp,
                'password': passwInp
            };

            fetch('http://127.0.0.1:5000/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(authData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message == "Аутентификация прошла успешно") {
                    loadShowcase();
                } else {
                    textAboutErr.textContent = 'Неверные данные для входа';
                }
            })
            .catch(error => {
                let textAboutErr = document.getElementById('incorrIpt');
                if (error.name === 'TypeError') {
                    textAboutErr.textContent = 'Сервер не работает';
                } else {
                    textAboutErr.textContent = 'Ошибка: ' + error;
                }
            });
        }
    } catch (err) {
        let textAboutErr = document.getElementById('incorrIpt');
        textAboutErr.textContent = err;
    }
}

function registration() {
    try {
        let regLogin = cleanInput(document.getElementById("reg_login").value),
            regPassword = cleanInput(document.getElementById('reg_password').value),
            regPasswordAccept = cleanInput(document.getElementById('reg_password_acp').value);

        if (regLogin === '' || regPassword === '' || regPasswordAccept === '') {
            let textAboutErr = document.getElementById('incorrIpt2');
            textAboutErr.textContent = 'Вы не ввели данные';
        } else if (regPassword !== regPasswordAccept) {
            let textAboutErr = document.getElementById('incorrIpt2');
            textAboutErr.textContent = 'Пароли отличаются друг от друга';
        } else {
            let regData = {
                'login': regLogin,
                'password': regPassword
            };
            let textAboutErr = document.getElementById('incorrIpt2');

            fetch('http://127.0.0.1:5000/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(regData)
            })
            .then(response => response.json())
            .then(data => {
                if (data['error'] !== "logVal") {
                    textAboutErr.textContent = 'Регистрация успешна';
                } else {
                    textAboutErr.textContent = data['message'];
                }
            })
            .catch(error => {
                let textAboutErr = document.getElementById('incorrIpt2');
                textAboutErr.textContent = 'Ошибка: ' + error;
            });
        }
    } catch (err) {
        let textAboutErr = document.getElementById('incorrIpt2');
        if (err.name === 'TypeError') {
            textAboutErr.textContent = 'Сервер не работает';
        } else {
            textAboutErr.textContent = 'Ошибка: ' + err;
        }
    }
}

signUp.addEventListener("click", () => {
    container.classList.add("active");
    document.querySelector(".form.login").classList.remove("active");
    document.querySelector(".form.signup").classList.add("active");
});

login.addEventListener("click", () => {
    container.classList.remove("active");
    document.querySelector(".form.signup").classList.remove("active");
    document.querySelector(".form.login").classList.add("active");
});