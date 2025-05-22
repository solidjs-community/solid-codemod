<p>
	<img width="100%" src="https://assets.solidjs.com/banner?type=Codemod&background=tiles&project=%20" alt="Solid ARIA">
</p>

# Solid Codemod

Codemod scripts for upgrading [SolidJS][solidjs] APIs and code,
powered by [JSCodeshift][jscodeshift].

## Usage

`npx solid-codemod <transforms> --target <target> --write`

- `transforms` - name of the transform (many can be used separated by
  spaces)
- `target` - directory or files to transform (many can be used
  separated by spaces)
- `write` - write changes, it defaults to dry run

## Codemod Transforms

| name                                      | description        |
| ----------------------------------------- | ------------------ |
| `solid-js@2/jsx-properties-to-attributes` | a test transformer |

## Writting Transforms

1. Look at the `transforms` folder, duplicate and edit a transform.
2. test your transform with `npm run test`
3. add the name to this readme file

## Contributing

We're currently looking for transformations which SolidJS community is
interested in. Please create a [feature request][feature-request] or
upvote/comment on [existing feature
requests][feature-request-existing] which have the input and output
code of the transformation you are looking for.

For example, here is a feature request to [transform
useState/useEffect of ReactJS to createSignal/onCleanup of
SolidJS][feature-request-example] for your reference.

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
