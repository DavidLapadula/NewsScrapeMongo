//scraping tools
let request = require("request");
let cheerio = require("cheerio");

module.exports = function (router, db) {

    // When hitting the home route, bring up all unsaved articles and renders the hompeage
    router.get("/", function (req, res) {
        db.Article.find({
            saved: false
        }, function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
                res.render("homePage", { Article: doc });
            }
        });
    })

    // When hitting the saved page, all saved articles are retrieved and the corresponding page renders
    router.get("/savedArticles", function (req, res) {
        db.Article.find({ saved: true }).populate("comments", 'body').exec(function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
                res.render("savedArticles", { saved: doc });
            }
        });
    });


    // This route gets hit when the user asks to 'scrape'
    router.get('/scrapedNews', function (req, res) {

        // store the link to the page that will be scraped
        let link = 'https://www.cp24.com/news';

        request(link, function (error, response, html) {

            // pass the HTML to cheerio
            let $ = cheerio.load(html);

            $("li.dc").each(function (i, element) {

                // empty object to store scraped content
                let content = {};

                // add value to the object
                content.link = $(element).children('div.element').children('div.teaser-image-wrapper').children('div.teaserImage').children('a').attr('href');
                content.imgLink = $(element).children('div.element').children('div.teaser-image-wrapper').children('div.teaserImage').children('a').children('img').attr('src');
                content.title = $(element).children('div.element').children('div.teaserText').children('div.bn-headline').children('h2.teaserTitle').children('a').text();
                content.desc = $(element).children('div.element').children('div.teaserText').children('div.lead-left').children('p').text();

                // First check if there is an article with the name of one that was scraped to prevent duplicates
                db.Article.findOne({ 'title': content.title })
                    .then(function (dbArticle) {
                        // If the article was not found, and is unique, create one
                        if (dbArticle === null) {
                            db.Article.create(content)
                            console.log(dbArticle)
                                .then(function (dbArticle) {
                                    // Print the article to the console if it was created successfully
                                    console.log(dbArticle);
                                })
                                .catch(function (err) {
                                    // If an error occurs, print it to the console
                                    console.log(err.message, 'message 1');
                                });
                        }
                    })
                    .catch(function (err) {
                        console.log(err.message, 'message 2');
                    });
                    console.log('waiting'); 
            });
            // send ok status if none of the catch blocks have been caught
            console.log('status')
            res.sendStatus('200'); 
        });
    });

    // put route to updated the article and turn the 'saved' boolean to true
    router.put("/saved/:id", function (req, res) {
        db.Article.update({ _id: req.params.id }, { $set: { saved: true } }, function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
                res.sendStatus('200');
            }
        });
    });

    // delete route for articles on the saved page
    router.put("/unsaved/:id", function (req, res) {
        db.Article.update({ _id: req.params.id }, { $set: { saved: false } }, function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
                res.sendStatus('200');
            }
        });
    });

    //post route for saving a note to an article
    router.post("/newNote/:id", function (req, res) {

        db.Note.create(req.body)
            .then(function (dbNote) {
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: dbNote._id } }, { new: true });
            })
            .then(function (dbArticle) {
                // Send updated status to client if all went ok
                res.sendStatus('201');
            })
            .catch(function (err) {
                // If an error occurs, send it back to the client
                res.sendStatus('404');
            });
    });

    // delete route to delete a note
    router.delete("/notes/delete/:id", function (req, res) {

        // get the id of the note that is to be deleted
        let id = req.params.id;

        db.Note.remove({ _id: id }, function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
                res.sendStatus('202');
            }
        });
    });
}