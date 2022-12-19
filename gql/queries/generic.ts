import Navbar from '../fragments/Navbar';

export default `
query AboutUsQuery {
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