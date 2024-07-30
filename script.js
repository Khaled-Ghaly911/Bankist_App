'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

let currentAccount, timer;

  //date upDate
  const formatMovmentDate = function(date, locale){
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  
  const dayPassed = calcDaysPassed(new Date(), date);

  if(dayPassed === 0) return 'Today';
  if(dayPassed === 1) return 'Yesterday '
  if(dayPassed <=7) return '${dayPassed} days ago'
  else{
    // const day = `${date.getDate()}`.padStart(2, '0')
    // const month = `${date.getMonth() + 1}`.padStart(2, '0')
    // const year = date.getFullYear()
    return new Intl.DateTimeFormat(locale).format(date);
  }
}

const formatCur = function(value, locale, currency){
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value)
}

//udating Ui 
const updateUi = function (acc) {
  //Display movements
  displayMovments(acc)

  //Display balance 
  calcDisplayBalance(acc)

  //Display Summary
  calcDisplaySummary(acc)
}

//log out timer 
const startLogoutTimer = function(){
  let time = 120;
  const tick = function(){
    const min = String(Math.trunc((time/60))).padStart(2, '0');
    const sec = String(Math.trunc((time%60))).padStart(2, '0');

    //in each call, print the remaining time
    labelTimer.textContent = `${min}:${sec}`

    
    //when 0, stop the time and log out the user 
    if(time === 0){
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`
      containerApp.style.opacity = 0;
    }
    //Decrease 1s
    time--;
  }
  //call the timer every second 
  tick();
  const timer = setInterval(tick,1000);
  return timer; 
}
  

const creatUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase().split(' ').map(name => name[0]).join('');
  });
}

creatUsername(accounts)

const displayMovments = function (acc, sort = false) {
  containerMovements.innerHTML = ''

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i])
    const displayDates = formatMovmentDate(date, acc.locale);

    const formatedMov = formatCur(mov, acc.locale, acc.currency)
    
    const html = `

      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDates}</div>
        <div class="movements__value">${formatedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
}

//Balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency)
}

//Summary 
const calcDisplaySummary = function (accs) {
  const income = accs.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(income, accs.locale, accs.currency);

  const out = (accs.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)) * -1;
  labelSumOut.textContent = formatCur(out, accs.locale, accs.currency);

  const interest = accs.movements.filter(mov => mov > 0).map(deposit => deposit * accs.interestRate / 100).filter((int, i, arr) => int > 1).reduce((acc, mov) => acc + mov, 0)
  labelSumInterest.textContent = formatCur(interest, accs.locale, accs.currency);
}


//Fake always logged in 
// currentAccount = account1;
// updateUi(currentAccount);
// containerApp.style.opacity = 100;






btnLogin.addEventListener('click', function (e) {

  e.preventDefault();
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display Ui and Welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
    containerApp.style.opacity = 100;

    //clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputClosePin.blur()



    //Creat date and time 
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday:'long'
    }
    // startLogoutTimer()
    // const locale =navigator.language; assigned to the current user 
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

    //timer
    if(timer){
      clearInterval(timer)
    }
    timer = startLogoutTimer();

        
    //update Ui
    updateUi(currentAccount);
  }
})


btnTransfer.addEventListener('click', function (e) {
  e.preventDefault()
  const amount = Number(inputTransferAmount.value)
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value)

  inputTransferAmount.value = inputTransferTo.value = ''

  if (amount > 0 && receiverAcc && currentAccount.balance >= amount && receiverAcc?.username !== currentAccount.username) {
    //transfer
    currentAccount.movements.push(-amount)
    receiverAcc.movements.push(amount)



    // add date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
   
    //reset timer
    clearInterval(timer)
    timer = startLogoutTimer();

    //update Ui
    updateUi(currentAccount);
  }
})

btnClose.addEventListener('click', function (e) {
  e.preventDefault()

  if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
    let index = accounts.findIndex(acc => acc.username === currentAccount.username);

    //Delete Acount
    accounts.splice(index, 1);

    //Hide Ui 
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
})


btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function(){//add loan
        currentAccount.movements.push(amount)

        //add date 
        currentAccount.movementsDates.push(new Date().toISOString());
        
        //update Ui
        updateUi(currentAccount)

        clearInterval(timer)
        timer = startLogoutTimer();
        }, 2500)
      }
      inputLoanAmount.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault()

  displayMovments(currentAccount.movements, !sorted)
  sorted = !sorted;
})

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const date = new Date()
console.log(date)
console.log(new Date(0))
console.log(account1)