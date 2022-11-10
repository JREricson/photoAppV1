# photoAppV1

## Description
Photo blog with user profiles. Each user has a profile page, albums, and photos. Site shows a map pinning locations of photos. photos are searchable through UI or API. Meta data, such As GPS coordinates and camera parameters, is extracted upon upload. 

This was my first attempt at making a large site back in 2020. There were many things that I learned along the way and many things I would change about the way it is programmed if I were to redo it today.

  
## Technology stack
Javascript/NodeJS, Express, Mongo Atlas, AWS S3 image hosting, Heroku deployment.

## Key features
- Authenticated user sessions
- Stylistic portfolio pages for each user
- Image uploads
- Automatic retrieval of meta data such as GPS location and camera parameters for photo uploads
- Automatic thumbnail generation for each photo
- Amazon S3 storage of photos
- MongoAtlas with models for Users, Albums, and Photos
- API generating json data based on complex queries
- Documentation for API
- UI has complex photo and user search options. 


## Site pages
### Profile page:
- Each user has their own profile page. The profile page has a carousel at the top, a list of the most recent galleries, a map showing pins of where each photo was taken on a map and a gallery of their most recent photos.
- The navbar transitions from faded to solid on scroll.
- Top header displays 5 images from photo gallery in a carousel, rotating through each every couple of seconds
![image header](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/photoHeader.png)


- Below that is a selection of albums the user has submitted. A default folder image is provided for albums without a cover photo. Cover photos can be set to whatever photo the user desires
![profile albums](https://github.com/JREricson/photoAppV1/blob/master/doc/ProfileAlbums.png?raw=true)

- Next, a map shows the locations of all photo taken by the user. Clicking on the pin will bring up a popup showing the photo and some details about it.
![profile map](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/profileMap.png)

- Finally, photos taken by the user are shown in a tiled view, auto adjusted to the viewport size.
![profile gallery](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/profileGallery.png)


### Photo search page:
All photos on the site are searchable through either an indexed text field or a power search taking advantage of the sites API. 
![photo power search](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/powersearch.png)
- Errors messages generated if query parameters are not met and shown at the top of the screen.
- Search criteria includes distance from a GPS coordinate, user who submitted photo, and camera parameters 


## API
- Documentation found [here](https://photo-exploration.herokuapp.com/api/)
- Two endpoints. one for user searches and one for photo searches.
- Allows advanced power searches with multiple queries (example with quey set to "api/photos?lat=15.4&lon=106&dist=70&fNumberMax=500$isoMax=500")
![api example](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/apiExample.png)
- API generates a list of errors, that are grouped into categories. (Example with query set to "api/photos?lat=53.4&dateBefore=1-3-2020&fNumberMax=500$isoMax=500"
![api example](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/APIError.png)


## Image services
- All images are uploaded to Amazon S3
- Thumbnails of several sizes are created automatically when uploaded.
- Pages will call thumbnails of differing sizes, depending on need
- To avoid unwanted access to paid service, photos are sent to website server and sent back to 	browser as a blob. This slows causes image downloads to be slow, but I did not want direct access to AWS service when I was first learning how to use it. I would remove that feature when I remake the site
 

## Database
- Utilizes Mongo Atlas. A managed version of MongoDB (noSQL).
- Models for Users, photos, and Albums
- Forms for allow for all CRUD operations on each model
- Photos are many-to-many for each album. One photo can belong to many albums. 
  a few things broke 
## UI
- Color scheme intended to be compatible with browser dark modes and normal viewing.


## Status
- Functional state
- The site had a few issues that needed to be addressed and few things broke when dependent services depreciated. 
- I plan to fix these soon for maintaining the portfolio, but the project has completed it's job at helping me learn and will not be updated beyond that


