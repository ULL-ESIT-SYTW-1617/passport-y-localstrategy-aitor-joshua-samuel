//Dependencias
var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');

gulp.task('deploy-gh-pages', function() {
  return gulp.src(['_book/*/*/*','_book/*/*','_book/*'])
    .pipe(ghPages());
});

gulp.task('deploy-github', function() {
  require('simple-git')()
          .add('.')
          .commit("commit")
          .push(['origin', 'master'], function() {});
});
var heroku = require('gitbook-start-heroku-aitor-joshua-samuel');
gulp.task('deploy-heroku',function() {
	heroku.deploy();
});
var addUser = require('./models'); 
gulp.task('new-user', function(cb) {
	return addUser.createUser();
});