# photoAppV1

## Description
Photo site that extracts meta data from photos (ie. GPS coordinates, shutter speed, fstop, camera manufacturer). REST based noSQL CRUD application. Each user has their own profile page

- site is functional but incomplete. I have plans to redo the site at a later point in time. At the moment, it is a little clunky and difficult to use. 
- site built for learning purposes
  
## Technology stack
Javascript/NodeJS, Express, Mongo Atlas, AWS S3 image hosting, Heroku deployment.

## Key features
Image uploads, thumbnail generation, external Mongo Atlas database, REST, CRUD, metdata extraction, documented API, advanced photo searches.

## Site pages
### Profile page:
- Top header displays first images in profiles (later version to include a choice for photo selection)
![image header](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/photoHeader.png)



- Below that is a selection of albums the user has submitted. A default folder image is provided for albums without a cover photo. Cover photos can be set.
![profile albums](https://github.com/JREricson/photoAppV1/blob/master/doc/ProfileAlbums.png?raw=true)

- Next, a map shows the location of all photo taken by the user.
![profile map](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/profileMap.png)

- Finally, photos taken by the user are shown in a tiled view, auto adjusted to the viewport size.
![profile gallery](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/profileGallery.png)


### Photo search page:
All photos on the site are searchable through either an indexed text field or a posersearch taking adnavage of the sites API. 
![photo power search](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/powersearch.png)
- errors generated if query parameters are not met – improved plan would not allow quey to be run without form being validate first


## API
- Documentation found [here](https://photo-exploration.herokuapp.com/api/)
- Allows search by users user name.
- Allows advanced power searches with multiple queries (example with quey set to "api/photos?lat=15.4&lon=106&dist=70&fNumberMax=500$isoMax=500")
![api example](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/apiExample.png)
- API generates a list of errors, that are grouped into categories. (Example with query set to "api/photos?lat=53.4&dateBefore=1-3-2020&fNumberMax=500$isoMax=500"
![api example](https://raw.githubusercontent.com/JREricson/photoAppV1/master/doc/APIError.png)


## Image services
- uploaded using AWS S3.
- Thumbnails of several sizes are created automatically upon upload.
- To avoid unwanted access to paid service, photos are sent to website server and sent back to 	browser as a blob. This slows causes image downloads to be slow, but I did not want direct 	access to AWS service
- Pages will call thumbnails of differing sizes, depending on need

## CRUD app
- Models for Users, photos, and Albums
- CRUD operations for all models
- Photos are many-to-many for each album. Deletion of an album does not result in the deletion of a photo

## UI
- UI needs a lot of work. I did not focus on this much as I am more interested in backend code 	and plan to redo the site when time permits
- Another reason why it needs work, is the plan for the interface has changed over time
- color scheme made to be compatible with browser dark modes

## Code
- This was a learning project. The majority of what was written was learned while making the site.  	Note that while asking why I might have made the choices I made
- I put effort into trying to make the code clean, organized, and readable; placing comments only where needed and adding descriptive variable names

## Planned improvements
	-this was a draft and my first time trying to make a large project. I was a learning process. I plan 	to rewrite the site in the future as site for myself to post pictures from where I have visited and 	to serve as a further learning tool
	-The UI will have major improvements, site might only be a place fro me to showcase photos to friends.

## Other notes
- Authenticated user sessions.
- Environment variables to protect sensitive data.





