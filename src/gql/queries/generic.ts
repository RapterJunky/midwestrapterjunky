import Navbar from '../fragments/Navbar';

const GenericPageQuery = `
query GenericPageQuery {
    _site {
        faviconMetaTags {
            attributes
            content
            tag
        }
    }
    navbar {
        ...NavbarRecordFragment
    }
}
${Navbar}
`;

export default GenericPageQuery;