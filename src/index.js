import './sass/main.scss';
import axios from 'axios';
import throttle from 'lodash.throttle';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import mustache from 'mustache';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import simpleLightbox from 'simplelightbox';

//CONSTANTS
const API_KEY = '33352480-5392e31dffbbb512fd85621a3';
const API_URL = 'https://pixabay.com/api/';
const refs = {
  form: document.querySelector('#search-form'),
  input: document.querySelector('[name="searchQuery"]'),
  gallery: document.querySelector('#gallery'),
  submitBtn: document.querySelector('#submitBtn'),
  loadBtn: document.querySelector('#loadBtn'),
  scrollToTopBtn: document.querySelector('.scrollToTopBtn'),
};
const TEMPLATE = `
<a href='{{largeImageURL}}' class='gallery__link'>
  <div class="photo-card">
    <img src="{{webformatURL}}" alt="{{tags}}" loading="lazy" class="photo-card__img"/>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        <span>{{likes}}</span>
      </p>
      <p class="info-item">
        <b>Views</b>
        <span>{{views}}</span>
      </p>
      <p class="info-item">
        <b>Comments</b>
        <span>{{comments}}</span>
      </p>
      <p class="info-item">
        <b>Downloads</b>
        <span>{{downloads}}</span>
      </p>
    </div>
  </div>
  </a>
`;
const paramsObj = {
  key: API_KEY,
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: '50',
  page: '1',
};

let paginationParamObj = {};
let totalHits = 0;
let lightbox = new SimpleLightbox('.gallery__link', { scrollZoom: false });

//FETCH IMAGES BY REQUEST
async function fetchImages(parameters) {
  const response = await axios.get(API_URL, { params: parameters });
  return response.data;
}

// PROCESS DATA AND RENDER GALLERY
async function renderGallery(parameters) {
  let renderedImages = '';
  try {
    const imagesData = await fetchImages(parameters);
    if (imagesData.hits.length != 0) {
      Object.values(imagesData.hits).forEach(image => {
        let renderedImage = mustache.render(TEMPLATE, image);
        renderedImages += renderedImage;
      });
      refs.gallery.insertAdjacentHTML('beforeend', renderedImages);
      lightbox.refresh();
    } else {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      refs.loadBtn.classList.add('visually-hidden');
      return;
    }

    if (parameters.page == 1) {
      Notify.success(`Hooray! We found ${imagesData.totalHits} images.`);
    }
    setTimeout(() => {
      if (imagesData.hits.length < parameters.per_page) {
        refs.loadBtn.classList.add('visually-hidden');
      } else {
        refs.loadBtn.classList.remove('visually-hidden');
      }
    }, 2000);
    totalHits = imagesData.totalHits;
  } catch (error) {
    console.log(error);
  }
}

//-------------------LISTENERS--------------------//
//USER INPUT
refs.form.addEventListener('input', e => {
  paramsObj.q = e.target.value;
});

//SUBMIT AND RENDER GALLERY
refs.form.addEventListener('submit', e => {
  e.preventDefault();
  if (refs.gallery.hasChildNodes) {
    refs.gallery.replaceChildren();
  }
  renderGallery(paramsObj);
  paginationParamObj = structuredClone(paramsObj);
});

//LOAD MORE PAGINATION
refs.loadBtn.addEventListener('click', () => {
  paginationParamObj.page = +paginationParamObj.page + 1;

  let hits = +gallery.childElementCount;
  if (hits < totalHits) {
    renderGallery(paginationParamObj);
  } else {
    refs.loadBtn.classList.add('visually-hidden');
    Notify.failure(
      `We're sorry, but you've reached the end of search results.`
    );
  }
});

//-------------------TO TOP BUTTON--------------------//
document.addEventListener('scroll', throttle(handleScroll, 300));

function handleScroll() {
  var scrollableHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  var GOLDEN_RATIO = 0.5;
  if (document.documentElement.scrollTop / scrollableHeight > GOLDEN_RATIO) {
    //show button
    refs.scrollToTopBtn.classList.remove('visually-hidden');
    console.log(document.documentElement.scrollTop);
    console.log(scrollableHeight);
    console.log(document.documentElement.scrollTop / scrollableHeight);
  } else {
    //hide button
    refs.scrollToTopBtn.classList.add('visually-hidden');
  }
}
refs.scrollToTopBtn.addEventListener('click', scrollToTop);

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
