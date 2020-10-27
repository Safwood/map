ymaps.ready(init);

function init() {
  //загрузка карты и меток
  const myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 11
  });

  const myClusterer = new ymaps.Clusterer({
    groupByCoordinates: true,
      clusterDisableClickZoom: true,
      clusterOpenBalloonOnClick: false
  });

  myMap.geoObjects.add(myClusterer);

  let placemark = '';
  let myGeoObjects = [];
  //myClusterer.add(myGeoObjects);

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
    console.log(myGeoObjects)
    myClusterer.add(myGeoObjects);

    placemark.events.add('click', (e) => {
    
      const placemarkCoords = e.get('target').geometry.getCoordinates();
      console.log(placemarkCoords);
      onPlacemarkClick(placemarkCoords)
    })
  }

  //function getPlacemarkCoordinates(mark) {
  //  placemark.events.add('click', () => {  
  //    const placemarkCoords = placemark.geometry.getCoordinates();
  //    console.log(placemarkCoords);
  //  })
  //  return placemarkCoords;
  //}

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

    const reviewList = root.querySelector('.reviews')
    const reviewForm = root.querySelector('#review-form')
    reviewForm.dataset.coords = JSON.stringify(coords);

    if (reviews) {  
      for (const review of reviews) {
        const div = document.createElement('div');
        div.classList.add('review-item');
        div.innerHTML = `
        <div>${review.review.name} (${review.review.place})</div>
        <div><i>${review.review.text}</i></div>
        `;

        reviewList.appendChild(div);

        if (review.coord == coords) {
        const div = document.createElement('div');
        div.classList.add('review-item');
        div.innerHTML = `
        <div>${review.review.name} (${review.review.place})</div>
        <div><i>${review.review.text}</i></div>
        `;

        reviewList.appendChild(div);
        }
      }
    }

    return root;
  }

  function onClick(coords) {
    //const list = JSON.parse(localStorage.getItem('markers'));
    const form = createForm(coords);

    openBalloon(coords);
    //setBalloonContent(form.innerHTML); 

   // const address = ymaps.geocode(coords).geoObjects.get(0).getAddressLine();

  }

  function onPlacemarkClick(coords) {
    const list = JSON.parse(localStorage.getItem('markers'));

    for (const mark of list) {
      console.log(mark.coord)
      console.log(coords)
      if (mark.coord === coords){
        const form = createForm(coords, mark);

        console.log(list)
    
        openBalloon(coords, form.innerHTML);
        //setBalloonContent(form.innerHTML); 
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
  
      try {
        localStorage.setItem('markers', JSON.stringify(markers))
        createPlacemark(coords)
        closeBalloon()
      } catch (e) {
        const formError = document.querySelector('.form-error');
        formError.innerText = e.message;
        console.log(e)
      }
    }
  })
}