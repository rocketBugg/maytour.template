// Определяем переменную "preprocessor"
let preprocessor = 'scss'; // Выбор препроцессора в проекте - scss или less

// Определяем константы Gulp
const { src, dest, parallel, series, watch } = require('gulp');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;

// Подключаем модули gulp-sass и gulp-less
const scss = require('gulp-sass');
const less = require('gulp-less');

// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

// Подключаем gulp-imagemin для работы с изображениями
const imagemin = require('gulp-imagemin');

// Подключаем модуль gulp-newer
const newer = require('gulp-newer');

// Подключаем модуль rigger
const rigger = require('gulp-rigger');

// Подключаем модуль del
const del = require('del');

function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: { baseDir: 'dist/' }, // Указываем папку сервера
        notify: false, // Отключаем уведомления
        online: true // Режим работы: true или false
    })
}

function html() {
    return src('app/*.html')
        .pipe(rigger())
        .pipe(dest('dist/'))
        .pipe(browserSync.reload({stream: true}));
}

function scripts() {
    return src([ // Берём файлы из источников
        'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
        'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
    ])
        .pipe(concat('app.min.js')) // Конкатенируем в один файл
        .pipe(uglify()) // Сжимаем JavaScript
        .pipe(dest('dist/js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function styles() {
    return src('app/' + preprocessor + '/style.' + preprocessor + '') // Выбираем источник: "app/scss/main.scss" или "app/less/main.less"
        .pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
        .pipe(concat('style.min.css')) // Конкатенируем в файл app.min.js
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
        .pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
        .pipe(dest('dist/css/')) // Выгрузим результат в папку "app/css/"
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function images() {
    return src('app/img/**/*') // Берём все изображения из папки источника
        .pipe(newer('dist/img/')) // Проверяем, было ли изменено (сжато) изображение ранее
        .pipe(imagemin()) // Сжимаем и оптимизируем изображеня
        .pipe(dest('dist/img/')) // Выгружаем оптимизированные изображения в папку назначения
}

function cleanimg() {
    return del('dist/img/**/*', { force: true }) // Удаляем всё содержимое папки "dist/img/dest/"
}


function startwatch() {

    // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);

    // Мониторим файлы препроцессора на изменения
    watch('app/**/' + preprocessor + '/**/*', styles);

    // Мониторим файлы HTML на изменения
    watch('app/**/*.html', html);

    // Мониторим папку-источник изображений и выполняем img(), если есть изменения
    watch('app/img/src/**/*', images);

}

function buildcopy() {
    return src([ // Выбираем нужные файлы
        'app/css/**/*.min.css',
        'app/js/**/*.min.js',
        'app/img/dest/**/*',
        'app/**/*.html',
    ], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
        .pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function cleandist() {
    return del('dist/**/*', { force: true }) // Удаляем всё содержимое папки "dist/"
}


// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспорт функции img() в таск img
exports.images = images;

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;

exports.html = html;

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, images, browsersync, startwatch, html);

// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleandist, styles, scripts, images, html, buildcopy);

exports.delimg = series(cleanimg);