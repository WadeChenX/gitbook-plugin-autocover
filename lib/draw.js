var Q = require('q');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var geopattern = require('geopattern');

var fontSize = require('./fontsize');
var titleParts = require('./titleparts');
var svgCompile = require('./svgcompile');
var svgRender = require('./svgrender');

var topics = require('./topic/');
var colors = require('./topic/colors.json');

module.exports = function(output, options) {

    //
    // Default options
    //

    options = _.defaultsDeep(options || {}, {
        "title": "",
        "author": "",
        "font": {
            "size": null,
            "family": "Arial",
            "color": '#424242'
        },
        "template": path.join(__dirname, "../templates/default.svg"),
        "watermark": path.join(__dirname, "../templates/published-with-gitbook.svg"),
		"info": {
			"color": "black",
			"short_desc": "",
			"date": "",
			"rev": ""
		},
        "size": {
            "w": 1800,
            "h": 2360
        },
        "background": {
            "color": '#fff'
        }
    });


    // Font
    var fontname = options.font.family;

    //
    // Topic color
    //

    var topic = topics(options.title)[0];

    options.topic = options.topic || {};
    options.topic.color = (topic && colors[topic]) ? colors[topic] : colors.default;


    //
    // Add pattern helper
    //
    var pattern = geopattern.generate(options.title);
    options.pattern = pattern;
    options.pattern_width = pattern.svg.svg.attributes.width;
    options.pattern_height = pattern.svg.svg.attributes.height;


    //
    // Title split in lines & size
    //

    // Dimensions of title's box
    var titleBox = {
        w: Math.floor(options.size.w * 0.8),
        h: Math.floor(options.size.h * 0.6),
    };
	
    // Dimensions of Info's box
    var InfoBox = {
        w: Math.floor(options.size.w * 0.8),
        h: Math.floor(options.size.h * 0.02),
    };


    // Title size
    options.size.title = options.size.title || fontSize(
        options.title, fontname,
        titleBox.w, titleBox.h
    );;
	
	// Info size
    options.size.info = options.size.info || fontSize(
        options.info.short_desc, fontname,
        InfoBox.w, InfoBox.h
    );;

    //
    // Author size
    //

    options.size.author = options.size.author || fontSize(
        options.author, fontname,
        titleBox.w, titleBox.h
    );


    //
    // Generate the cover
    //

    var template = fs.existsSync('cover.svg') ? 'cover.svg' : options.template;

    // Make SVG with options
    return svgCompile(template, options)
    .then(function(svg) {
        // Render SVG to JPEG
        return svgRender(output, svg, options.size.w, options.size.h);
    });
};
