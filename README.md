<p>
	<img width="100%" src="https://assets.solidjs.com/banner?type=Codemod&background=tiles&project=%20" alt="Solid ARIA">
</p>

# Solid Codemod

Codemod scripts for upgrading [SolidJS][solidjs] APIs and code,
powered by [JSCodeshift][jscodeshift].

## Usage

`npx solid-codemod <transforms> <paths> --write`

- `transforms` - transforms names
- `paths` - directories or files to transform
- `--write` or `-w` - write changes (it defaults to dry run)

NOTES:

- It doesnt accept or use globs.
- Many `transforms` or `paths` can be provided separated by spaces
- When `paths` is not provided it runs tests on the selected
  transforms
- Once its done it will display a green `DONE`
- Transforms should modify code when "reliable possible"

## Examples

- `solid-codemod` - run all transforms internal tests.
- `solid-codemod solid-js@2/jsx-properties-to-attributes` - run
  internal tests for selected transform.
- `solid-codemod solid-js@2/jsx-properties-to-attributes .` - dry run
  transform on current directory.
- `solid-codemod solid-js@2/jsx-properties-to-attributes . -w` - run
  transform on current directory and write changes to files.

## Codemod Transforms

### `solid-js@2/jsx-properties-to-attributes`

Used to update JSX properties vs attributes, from Solid 1.x to Solid
2.x.

- CamelCase attributes to lowercase on known tags (not in components)
- Unwrap `attr:` for known attributes
- `onsubmit="return false"` -> `attr:onsubmit="return false"`
- Ensure `boolean` attributes values (for static/conditional values)
- Ensure `pseudo-boolean` attributes values (for static/conditional
  values)
- Warn of unknown attributes

Warning: Do not use in already established Solid 2.x code as it
assumes the code is Solid 1.x. For example `false` is a valid way to
remove an attribute in Solid 2.x, while in Solid 1.x it means to have
an attribute with that value.

### `solid-js@2/jsx-classlist-to-class`

Used to rename `classList` attribute to `class`
https://docs.solidjs.com/concepts/components/class-style

## Writing Transforms

1. Look at the `transforms` folder, duplicate and edit a transform.
2. Test your transform with
   `solid-codemod solid-js@2/your-transform-name`
3. Add the transform to the readme with a description
4. May use `src/transforms/shared.js` for shared code

### Helpers

Some shared code exits for helping author transforms.

- `src/transforms/shared.js` - helpers for parsing and logging changes
  to console.
- `src/data` - data helpers for specific Solid versions

## Contributing

We're currently looking for transformations which SolidJS community is
interested in. Please create a [feature request][feature-request] or
upvote/comment on [existing feature
requests][feature-request-existing] which have the input and output
code of the transformation you are looking for.

For example, here is a feature request to [transform
useState/useEffect of ReactJS to createSignal/onCleanup of
SolidJS][feature-request-example] for your reference.

## TODO

- organize issues
- transfer npm to the solid project
- figure out how to autopublish to npm

## License

MIT

[feature-request]:
	https://github.com/trivikr/solid-codemod/issues/new?assignees=&labels=enhancement&template=feature_request.yml&title=%5BFeature%5D%3A+
[feature-request-example]:
	https://github.com/trivikr/solid-codemod/issues/1
[feature-request-existing]:
	https://github.com/trivikr/solid-codemod/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aenhancement
[jscodeshift]: https://github.com/facebook/jscodeshift
[solidjs]: https://www.solidjs.com/
