### To transform one file, use [src/one.js](/src/one.js):
```properties
node src/one.js transform --filePath="./input/example.png" --outputDir="./output"
```

### To transform a bunch of files, use [src/many.js](/src/many.js):
```properties
node src/many.js run --inputDir="./input" --outputDir="./output"
```

Along with SVGs, it'll also create `parsing-log.json` in your home directory with all failed files if some errors occur. Thus, you can easily filter them and retry transformation.

### Filter files

If a transformation process is interrupted or some errors occured, you may want to retry transformation only with files are not transformed yet. To do this, use helper [src/filter.js](/src/filter.js).

Open the helper, define `INPUT_PATH` as your input path and `OUTPUT_PATH` as your output path. Then run:

```properties
node src/filter.js
```

It removes from `INPUT_PATH` those files which also exist in `OUTPUT_PATH`.