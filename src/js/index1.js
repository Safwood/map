ymaps.ready(init);

async function init() {
  //загрузка карты и меток
  const myMap = await new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 11
  });

  const myClusterer = await new ymaps.Clusterer({
    groupByCoordinates: false,
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: false
  });

  await myMap.geoObjects.add(myClusterer);

  let placemark = '';
  let myGeoObjects = [];

   addExistingPlacemarks();

  //работа с картой
  let coords = '';
  const formTemplate = document.querySelector('#addFormTemplate').innerHTML;

  myMap.events.add('click', (e) => {
    coords = e.get('coords');
    onClick(coords);
  })
  
  function createPlacemark(coords) {
    placemark = new ymaps.Placemark(coords);

    myGeoObjects.push(placemark)
    myClusterer.add(myGeoObjects);

    placemark.events.add('click', (e) => {
      const placemarkCoords = e.get('target').geometry.getCoordinates();

      onPlacemarkClick(placemarkCoords)
    })
  }

  function openBalloon(coords, content) {
    myMap.balloon.open(coords, content);
  }
  
  function closeBalloon() {
    myMap.balloon.close();
  }

  //геоотзыв
  function addExistingPlacemarks() {
    if  (localStorage.getItem('markers')) {
      const allReviews = JSON.parse(localStorage.getItem('markers'));
      const newArray = [];
      const array = [];

      for (const el of allReviews) {
        if (!newArray || !newArray.includes(JSON.stringify(el.coord))) {
          newArray.push(JSON.stringify(el.coord))
          array.push(el.coord)
        }
      }
      for (const review of array) {
        createPlacemark(review);
      }
    }
  }

  function createForm(coords, reviews) {
    const root = document.createElement('div');
    root.innerHTML = formTemplate;
    const reviewForm = root.querySelector('#review-form')
    reviewForm.dataset.coords = JSON.stringify(coords);

    if (reviews) {  
      for (const review of reviews) {
        const reviewList = root.querySelector('.reviews')
        const li = document.createElement('li');
        li.classList.add('reviews__item');
        li.innerHTML = `
        <div class="reviews__item-name">${review.review.name}</div>
        <div class="reviews__item-place">${review.review.place}</div>
        <div class="reviews__item-text">${review.review.text}</div>
        `;

        reviewList.appendChild(li);
      }
    }

    return root;
  }

  function onClick(coords) {
    const form = createForm(coords);

    openBalloon(coords, form.innerHTML);

    //console.log(myMap)

    const address = getAdress(coords)

        console.log(address)
    
    function getAdress (coords) {
      return new Promise ((resolve, reject) => {
        ymaps
        .geocode(coords)
        .then((response) => resolve(response.geoObjects.get(0).getAddressLine()))
        .then((response) => resolve(response.geoObjects.get(0).getAddressLine()))
        .catch((e) => reject(e));

        
      })
    }
    
    
  }

  function onPlacemarkClick(coords) {
    const list = JSON.parse(localStorage.getItem('markers'));
    const shortList = []; 

    for (const mark of list) {
      if (JSON.stringify(mark.coord) == JSON.stringify(coords)) {
        shortList.push(mark);
      }
    }
    const form = createForm(coords, shortList);

    openBalloon(coords, form.innerHTML);
  }

  function contains(arr, elem) {
    for (let i = 0; i < arr.length; i++) {
        if (JSON.stringify(arr[i]) === JSON.stringify(elem)) {
            return true;
        }
    }
    return false;
  }

  document.body.addEventListener('click', (e) => {
    if (e.target.dataset.role === 'review-add') {
      const reviewForm = document.querySelector('#review-form')
      const coords = JSON.parse(reviewForm.dataset.coords);
  
      const data = 
      {
        coord: coords,
        review: {
          name: document.querySelector('[data-role=review-name]').value,
          place: document.querySelector('[data-role=review-place]').value,
          text: document.querySelector('[data-role=review-text]').value
        }
      }
  
      ////////
      const savedMarks = JSON.parse(localStorage.getItem('markers'))
      const array = [];

      if  (savedMarks) {
        for (const mark of savedMarks) {
        const coord = mark.coord;
        array.push(coord)
      }}

      const answer = contains(array, coords)

      //////////
      let markers = [];
  
      if (localStorage.getItem('markers')) {
        markers = JSON.parse(localStorage.getItem('markers'));
      } 
  
      markers.push(data);
      localStorage.setItem('markers', JSON.stringify(markers));

      if (!answer) {
        createPlacemark(coords)
      }

      ////////////////////
      closeBalloon()
    }
  })
}