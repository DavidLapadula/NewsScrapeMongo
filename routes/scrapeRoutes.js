//scraping tools
let request = require("request");
let cheerio = require("cheerio");
let methodOverride = require("method-override");

module.exports = function (router, db) {

    router.get("/", function (req, res) {
        db.Article.find({
            saved: false
        }, function (err, doc) {
            if (err) {
                // res.send(err);
                console.log(err)
            }

            else {
                res.render("homePage", { Article: doc })
                // console.log({Article: doc}); 
            }
        });
    })

    // This route renders the saved handledbars page
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

    router.get('/scrapedNews', function (req, res) {
        // First, we grab the body of the html with request

        let link = 'https://www.cp24.com/news';

        request(link, function (error, response, html) {

            let $ = cheerio.load(html);


            $("li.dc").each(function (i, element) {

                let content = {};


                let $href = $(element).children('div.element').children('div.teaser-image-wrapper').children('div.teaserImage').children('a').attr('href');
                let $img = $(element).children('div.element').children('div.teaser-image-wrapper').children('div.teaserImage').children('a').children('img').attr('src');
                let $heading = $(element).children('div.element').children('div.teaserText').children('div.bn-headline').children('h2.teaserTitle').children('a').text();
                let $desc = $(element).children('div.element').children('div.teaserText').children('div.lead-left').children('p').text();

                content.title = $heading;
                content.link = $href;
                content.desc = $desc;
                content.imgLink = $img;


                db.Article.findOne({ 'title': content.title })
                    .then(function (dbArticle) {
                        // View the added result in the console
                        if (dbArticle === null) {
                            db.Article.create(content)
                                .then(function (dbLibrary) {
                                    // If saved successfully, print the new Library document to the console
                                    console.log(dbLibrary);
                                })
                                .catch(function (err) {
                                    // If an error occurs, print it to the console
                                    console.log(err.message, 'message');
                                });
                        } else {
                            console.log('article present')
                        }
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        // return res.json(err);
                    });

            });
        });
        // Tell the browser that we finished scraping the text
        res.send("Scraped");
    })

    // put route to updated the article to be saved:true
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

        let articleId = req.params.id; 
        
        console.log(req.body);
        console.log(articleId); 



        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Book was created successfully, find one library (there's only one) and push the new Book's _id to the Library's `books` array
                // { new: true } tells the query that we want it to return the updated Library -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                console.log(dbNote + 'note')
                return db.Article.findOneAndUpdate({_id: articleId}, { $push: { comments: dbNote._id } }, { new: true });
            })
            .then(function (dbArticle) {
                // If the Library was updated successfully, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurs, send it back to the client
                res.json(err);
            });
    });

    // delete route to delete a note
    router.delete("/notes/delete/:id", function (req, res) {

        let id = req.params.id; 

        console.log(id)
        db.Note.remove({ _id: id }, function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
                res.send("Deleted");
            }
        });
    });
}