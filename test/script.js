const query = `
  query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    idMal
    title {
      romaji
      english
      native
      userPreferred
    }
    synonyms
    format
    status
    episodes
    duration
    season
    seasonYear
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    description(asHtml: false)
    averageScore
    meanScore
    popularity
    favourites
    isAdult
    genres
    tags {
      name
      description
      isMediaSpoiler
      rank
    }
    countryOfOrigin
    source
    trailer {
      id
      site
      thumbnail
    }
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    studios {
      nodes {
        name
        isAnimationStudio
      }
    }
    characters(perPage: 10, sort: [ROLE, RELEVANCE]) {
      edges {
        role
        voiceActors(language: JAPANESE) {
          name {
            full
          }
          language
          image {
            large
          }
        }
        node {
          name {
            full
          }
          image {
            large
          }
        }
      }
    }
    staff(perPage: 10) {
      edges {
        role
        node {
          name {
            full
          }
          image {
            large
          }
        }
      }
    }
    relations {
      edges {
        relationType
        node {
          id
          title {
            romaji
          }
          type
          format
        }
      }
    }
    externalLinks {
      site
      url
    }
    rankings {
      rank
      type
      context
      year
    }
    siteUrl
  }
}

`;

const fetchButton = document.getElementById('fetch-button');

const variables = {
    id: 100 // Change this to any AniList anime ID (e.g., 15125 for One Punch Man)
};

fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query,
        variables
    })
})
    .then(res => res.json())
    .then(data => {
        console.log('AniList Anime Data:', data.data.Media);
    })
    .catch(err => {
        console.error('AniList API error:', err);
    });



