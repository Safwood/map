
//инициализация карты

class InteractiveMap {
  constructor (mapId, onClick) {
    this.mapId = mapId;
    this.onClick = onClick;
  }

  async init() {
    await this.injectMapsScript();
    await this.loadMaps();
    this.initMap();
  }

  injectMapsScript() {
    return new Promise ((resolve) => {
    const scriptTag = document.createElement('script');
    scriptTag.src = "https://api-maps.yandex.ru/2.1/?apikey=a1a2f750-e9d8-4258-8e3a-30785014eede&lang=ru_RU";
    document.body.appendChild(scriptTag);
    scriptTag.addEventListener('load', resolve);
    })
  }

  loadMaps() {
    return new Promise ((resolve) => ymaps.ready(resolve));
  }

  initMap() {
    this.map = new ymaps.Map(this.mapId, {
      center: [55.76, 37.64],
      zoom: 11,
    });

    this.clusterer = new ymaps.Clusterer({
      groupByCoordinates: true,
      clusterDisableClickZoom: true,
      clusterOpenBalloonOnClick: false
    });

    this.clusterer.events.add('click', (e) => {
      const coords = e.get('target').geometry.getCoordinates();
      this.onClick(coords);
      
    });

    this.map.events.add('click', (e) => {
      this.onClick(e.get('coords'));
      
    })
    this.map.geoObjects.add(this.clusterer);

  }
  openBalloon(coords, content) {
    this.map.balloon.open(coords, content);
  }
  
  setBalloonContent (content) {
    this.map.balloon.setData(content);
  }

  closeBalloon() {
    this.map.balloon.close();
  }

  createPlacemark(coords) {
    const placemark = new ymaps.Placemark(coords);
      placemark.events.add('click', (e) => {
      const coords = e.get('target').geometry.getCoordinates();
      
      this.onClick(coords)

    })
    this.clusterer.add(placemark);
  }
}

//геоотзыв

class GeoReview {
  constructor() {
    this.formTemplate = document.querySelector('#addFormTemplate').innerHTML;
    this.map = new InteractiveMap('map', this.onClick.bind(this));
    this.map.init().then(this.onInit.bind(this));
  }

  onInit() {
    if  (localStorage.getItem('markers')) {
      const allReviews = JSON.parse(localStorage.getItem('markers'));

      for (const review of allReviews) {
        this.map.createPlacemark(review.coord);
      }
    }

    document.body.addEventListener('click', this.onDocumentClick.bind(this));
  }

  createForm(coords, reviews) {
    const root = document.createElement('div');
    root.innerHTML = this.formTemplate;
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

  onClick(coords) {
    const list = JSON.parse(localStorage.getItem('markers'));
    const form = this.createForm(coords, list);

    this.map.openBalloon(coords, form.innerHTML);
    this.map.setBalloonContent(form.innerHTML); 
    
  }

  onDocumentClick(e) {
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
        this.map.createPlacemark(coords)
        this.map.closeBalloon()
      } catch (e) {
        const formError = document.querySelector('.form-error');
        formError.innerText = e.message;
        console.log(e)
      }
    }
  }
}

new GeoReview();






