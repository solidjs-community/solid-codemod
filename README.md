<p>
	<img width="100%" src="https://assets.solidjs.com/banner?type=Codemod&background=tiles&project=%20" alt="Solid ARIA">
</p>

# WIP Solid Codemod

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

## Codemod Transforms

| name                                      | description            |
| ----------------------------------------- | ---------------------- |
| `solid-js@2/jsx-properties-to-attributes` | a test transformer WIP |

## Writing Transforms

1. Look at the `transforms` folder, duplicate and edit a transform.
2. Test your transform with `solid-codemod your-transform-name`
3. Add the transform to the readme with a description
4. May use `src/transforms/shared.js` for shared code

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
- provide a `classList` to `class` transform
- finish `solid-js@2/jsx-properties-to-attributes` transform
- document `Markup` and `shared.js` helpers
- example usage should show more usage including testing
- make it clear project focus on solid v2

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
