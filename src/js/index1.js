ymaps.ready(init);

function init() {
  //загрузка карты и меток
  const myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 11
  });

  const myClusterer = new ymaps.Clusterer({
    groupByCoordinates: false,
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: false
  });

  myMap.geoObjects.add(myClusterer);

  let placemark = '';
  let myGeoObjects = [];

  addExistingPlacemarks();

  //работа с картой
  let coords = '';
  const formTemplate = document.querySelector('#addFormTemplate').innerHTML;

  myMap.events.add('click', (e) => {
    coords = e.get('coords');
    console.log
    onClick(coords);
  })
  
  function createPlacemark(coords) {
    placemark = new ymaps.Placemark(coords);
    //if (!myGeoObjects.includes(placemark)) {
      myGeoObjects.push(placemark)
      myClusterer.add(myGeoObjects);
    //}
    
    console.log(myGeoObjects)
    
    placemark.events.add('click', (e) => {
      const placemarkCoords = e.get('target').geometry.getCoordinates();

      console.log(e)
      onPlacemarkClick(placemarkCoords)
    })
  }

  function openBalloon(coords, content) {
    myMap.balloon.open(coords, content);
  }
  
  //function setBalloonContent (content) {
  //  myMap.balloon.setData(content);
  //}

  function closeBalloon() {
    myMap.balloon.close();
  }

  //геоотзыв

  function addExistingPlacemarks() {
    if  (localStorage.getItem('markers')) {
      const allReviews = JSON.parse(localStorage.getItem('markers'));

      for (const review of allReviews) {
        createPlacemark(review.coord);
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
        const div = document.createElement('div');
        div.classList.add('review-item');
        div.innerHTML = `
        <div>${review.review.name} (${review.review.place})</div>
        <div><i>${review.review.text}</i></div>
        `;

        reviewList.appendChild(div);

        //if (review.coord == coords) {
        //const div = document.createElement('div');
        //div.classList.add('review-item');
        //div.innerHTML = `
        //<div>${review.review.name} (${review.review.place})</div>
        //<div><i>${review.review.text}</i></div>
        //`;

        //reviewList.appendChild(div);
        //}
      }
    }

    return root;
  }

  function onClick(coords) {
    
    const form = createForm(coords);
    openBalloon(coords, form.innerHTML);
  }

  function onPlacemarkClick(coords) {
    const list = JSON.parse(localStorage.getItem('markers'));

    for (const mark of list) {
      const shortList = []; 

      console.log(mark.coord)
      console.log(coords)

      if (JSON.stringify(mark.coord) == JSON.stringify(coords)) {
        console.log(mark.coord)
        shortList.push(mark);

        const form = createForm(coords, shortList);

        console.log(shortList)
    
        openBalloon(coords, form.innerHTML);
        //setBalloonContent(form.innerHTML); 
        // const address = ymaps.geocode(coords).geoObjects.get(0).getAddressLine();
      }
    }
    
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
  
      let markers = [];
  
      if (localStorage.getItem('markers')) {
        markers = JSON.parse(localStorage.getItem('markers'));
      } 
  
      markers.push(data);
  
      localStorage.setItem('markers', JSON.stringify(markers));
      if (!myGeoObjects.includes(coords)){
        createPlacemark(coords)
      }
      closeBalloon()
      
    }
  })
}