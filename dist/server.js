/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/server/server.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/server/books.js":
/*!*****************************!*\
  !*** ./src/server/books.js ***!
  \*****************************/
/*! exports provided: booksRouter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"booksRouter\", function() { return booksRouter; });\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var knex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! knex */ \"knex\");\n/* harmony import */ var knex__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(knex__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var multer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! multer */ \"multer\");\n/* harmony import */ var multer__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(multer__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n\nconst booksRouter = Object(express__WEBPACK_IMPORTED_MODULE_0__[\"Router\"])();\n\nlet db = knex__WEBPACK_IMPORTED_MODULE_1___default()({\n    debug: true,\n    client: 'mysql',\n    connection: {\n        host: '127.0.0.1',\n        user: 'root',\n        password: 'hello123',\n        database: 'local_library'\n    }\n});\n\nbooksRouter.get('/', function (req, res) {\n    db().select('Id', 'BookName', 'BookDescr')\n        .from('Books')\n        .then(response => {\n            res.json({\n                books: response.map(row => ({\n                    id: row.Id,\n                    name: row.BookName,\n                    description: row.BookDescr\n                }))\n            });\n        })\n});\n\nconst upload = multer__WEBPACK_IMPORTED_MODULE_2___default()();\n\nbooksRouter.post('/', upload.none(), function (req, res) {\n    const {name, description} = req.body;\n    db('Books')\n        .returning('Id')\n        .insert({\n            BookName: name,\n            BookDescr: description\n        }).then(([id]) => {\n            res.json({\n                ...req.body,\n                id\n            });\n        });\n});\n\nbooksRouter.delete('/', function (req, res) {\n    const {id} = req.body;\n    db('Books')\n        .where('id', id)\n        .del()\n        .then(count => {\n            res.json({\n                wasRemoved: count === 1\n            });\n        });\n});\n\n\n//# sourceURL=webpack:///./src/server/books.js?");

/***/ }),

/***/ "./src/server/server.js":
/*!******************************!*\
  !*** ./src/server/server.js ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var webpack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! webpack */ \"webpack\");\n/* harmony import */ var webpack__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(webpack__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! webpack-dev-middleware */ \"webpack-dev-middleware\");\n/* harmony import */ var webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _webpack_config_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../webpack.config.js */ \"./webpack.config.js\");\n/* harmony import */ var _webpack_config_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_webpack_config_js__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _books__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./books */ \"./src/server/books.js\");\n\n\n\n\n\n\n\nconst app = express__WEBPACK_IMPORTED_MODULE_1___default()(),\n            DIST_DIR = __dirname,\n            HTML_FILE = path__WEBPACK_IMPORTED_MODULE_0___default.a.join(DIST_DIR, 'index.html'),\n            compiler = webpack__WEBPACK_IMPORTED_MODULE_2___default()(_webpack_config_js__WEBPACK_IMPORTED_MODULE_4___default.a);\n\napp.use(webpack_dev_middleware__WEBPACK_IMPORTED_MODULE_3___default()(compiler, {\n  publicPath: _webpack_config_js__WEBPACK_IMPORTED_MODULE_4___default.a.output.publicPath\n}));\n\napp.use(express__WEBPACK_IMPORTED_MODULE_1___default.a.json());\n\napp.use('/books', _books__WEBPACK_IMPORTED_MODULE_5__[\"booksRouter\"]);\n\napp.get('*', (req, res, next) => {\n    compiler.outputFileSystem.readFile(HTML_FILE, (err, result) => {\n        if (err) {\n            return next(err);\n        }\n        res.set('content-type', 'text/html');\n        res.send(result);\n        res.end();\n    });\n});\n\nconst PORT = process.env.PORT || 8080\napp.listen(PORT, () => {\n    console.log(`App listening to ${PORT}....`);\n    console.log('Press Ctrl+C to quit.');\n});\n\n\n//# sourceURL=webpack:///./src/server/server.js?");

/***/ }),

/***/ "./webpack.config.js":
/*!***************************!*\
  !*** ./webpack.config.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const path = __webpack_require__(/*! path */ \"path\");\nconst webpack = __webpack_require__(/*! webpack */ \"webpack\");\nconst HtmlWebPackPlugin = __webpack_require__(/*! html-webpack-plugin */ \"html-webpack-plugin\");\n\nmodule.exports = {\n    entry: {\n        main: './src/js/index.js'\n    },\n    output: {\n        path: path.join(__dirname, 'dist'),\n        publicPath: '/',\n        filename: '[name].js'\n    },\n    mode: 'development',\n    target: 'web',\n    devtool: 'source-map',\n    module: {\n        rules: [\n            {\n                test: /\\.html$/,\n                use: [\n                    {\n                        loader: \"html-loader\"\n                    }\n                ]\n            },\n            {\n                test: /\\.s(a|c)ss$/,\n                loader: [\n                    'style-loader',\n                    'css-loader',\n                    {\n                        loader: 'sass-loader',\n                        options: {\n                            sourceMap: true\n                        }\n                    }\n                ]\n            },\n            {\n                test: /\\.(png|svg|jpg|gif)$/,\n                use: ['file-loader']\n            }\n        ]\n    },\n    plugins: [\n        new HtmlWebPackPlugin({\n            template: \"./src/html/index.html\",\n            filename: \"./index.html\",\n            excludeChunks: ['server']\n        }),\n        new webpack.NoEmitOnErrorsPlugin()\n    ]\n};\n\n\n//# sourceURL=webpack:///./webpack.config.js?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "html-webpack-plugin":
/*!**************************************!*\
  !*** external "html-webpack-plugin" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"html-webpack-plugin\");\n\n//# sourceURL=webpack:///external_%22html-webpack-plugin%22?");

/***/ }),

/***/ "knex":
/*!***********************!*\
  !*** external "knex" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"knex\");\n\n//# sourceURL=webpack:///external_%22knex%22?");

/***/ }),

/***/ "multer":
/*!*************************!*\
  !*** external "multer" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"multer\");\n\n//# sourceURL=webpack:///external_%22multer%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ }),

/***/ "webpack":
/*!**************************!*\
  !*** external "webpack" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"webpack\");\n\n//# sourceURL=webpack:///external_%22webpack%22?");

/***/ }),

/***/ "webpack-dev-middleware":
/*!*****************************************!*\
  !*** external "webpack-dev-middleware" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"webpack-dev-middleware\");\n\n//# sourceURL=webpack:///external_%22webpack-dev-middleware%22?");

/***/ })

/******/ });