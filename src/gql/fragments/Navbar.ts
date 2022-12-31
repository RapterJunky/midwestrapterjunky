const NavbarFragment = `
    fragment NavbarRecordFragment on NavbarRecord {
        bgColor {
            hex
        }
        pageLinks {
            icon
            iconPosition
            useIcon
            link
            title
        }
        logo {
            blurUpThumb(quality: 10)
            responsiveImage {
              src
              sizes
              alt
            }
        }
    }
`;
export default NavbarFragment;