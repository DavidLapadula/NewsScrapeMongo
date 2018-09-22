//scraping tools
let request = require("request");
let cheerio = require("cheerio");
let Article = require("../models/Article.js");

module.exports = function (router, db) {

    // When hitting the home route, bring up all unsaved articles and renders the hompeage
    router.get("/", function (req, res) {
        // db.Article.find({
        //     saved: false
        // }).sort('-date', function (err, doc) {
        //     if (err) {
        //         res.send(err);
        //     }
        //     else {
        //         res.render("homePage", { Article: doc });
        //     }
        // });
        db.Article.find({saved: false}).sort('-date').exec(function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
                res.render("homePage", { Article: doc });
            }
    
        })
    })

    router.get("/test", function (req, res) {
        bla = '5ba3a4ffe2a93752489f6ff5'
        db.Article.find({
            _id: bla
        },  function (err, doc) {
            if (err) {
                res.send(err);
            }
            else {
               return res.send({
                    document: doc,
                    success: true, 
                    message: 'Good job'
                });
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
            let entries = []; 
            $("li.dc").each(function (i, element) {
                // empty object to store scraped content
                let content = {};
                // add value to the object
                content.link = $(element).children('div.element').children('div.teaser-image-wrapper').children('div.teaserImage').children('a').attr('href');
                content.imgLink = $(element).children('div.element').children('div.teaser-image-wrapper').children('div.teaserImage').children('a').children('img').attr('src');
                content.title = $(element).children('div.element').children('div.teaserText').children('div.bn-headline').children('h2.teaserTitle').children('a').text();
                content.desc = $(element).children('div.element').children('div.teaserText').children('div.lead-left').children('p').text();
                content.date = Date.now()
                // First check if there is an article with the name of one that was scraped to prevent duplicates
                if (content.link && content.imgLink && content.title && content.desc) {
                    entries.push(new Article(content));  
                }
            });
            for (let i = 0; i < entries.length; i++) {
                entries[i].save(function(err, data) {
                    if (err) {
                        console.log(err);
                    } 
                    else {
                        console.log(data);
                    }
                });
                // retrieves articles from db only after all entries have been made
                if (i === (entries.length - 1)) {
                    res.redirect("/");
                }
            }
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