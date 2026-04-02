import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TOKENS } from "../theme";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
// import FavoriteIcon from "@mui/icons-material/Favorite";
import LayersIcon from "@mui/icons-material/Layers";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", path: "/Homepage" },
        { label: "Create Blog", path: "/Homepage/create" },
        { label: "Published", path: "/Homepage/published" },
        { label: "Saved", path: "/Homepage/saved" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/Homepage" },
        { label: "Blogs", path: "/Homepage" },
        { label: "Contact", path: "/Homepage" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: <TwitterIcon sx={{ fontSize: 18 }} />,
      url: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <LinkedInIcon sx={{ fontSize: 18 }} />,
      url: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: <GitHubIcon sx={{ fontSize: 18 }} />,
      url: "https://github.com",
      label: "GitHub",
    },
    {
      icon: <EmailIcon sx={{ fontSize: 18 }} />,
      url: "mailto:hello@buildblogs.com",
      label: "Email",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isDark ? "#0a0a0a" : TOKENS.copper,
        borderTop: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        pt: { xs: 6, md: 8 },
        pb: 3,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "3fr 1fr 1fr",
            },
            gap: { xs: 4, sm: 5, md: 8 },
            mb: 5,
          }}
        >
          {/* Brand Column */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              width={200}
              mb={2}
              sx={{ cursor: "pointer" }}
            >
              <Box
                onClick={() => navigate("/Homepage")}
                sx={{
                  cursor: "pointer",
                  width: 36,
                  height: 36,
                  bgcolor: isDark ? TOKENS.copper : "#0a0a0a",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LayersIcon sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
              <Typography
                onClick={() => navigate("/Homepage")}
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.35rem",
                  color: "text.primary",
                  letterSpacing: "0.01em",
                  fontWeight: 700,
                }}
              >
                BuildBlogs
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: "0.875rem",
                lineHeight: 1.7,
                color: "text.primary",
                mb: 3,
                maxWidth: 320,
              }}
            >
              Where ideas find their voice. A modern platform for writers,
              creators, and storytellers.
            </Typography>

            <Stack direction="row" spacing={1}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.09)",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: isDark ? TOKENS.copper : "#0a0a0a",
                      color: "#fff",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Box>

          {/* Link Columns */}
          {footerLinks.map((section) => (
            <Box key={section.title}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "text.primary",
                  mb: 2,
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.links.map((link) => (
                  <MuiLink
                    key={link.label}
                    onClick={() => link.path !== "#" && navigate(link.path)}
                    sx={{
                      fontSize: "0.875rem",
                      color: "text.primary",
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: isDark ? TOKENS.copper : "#fff",
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography
            sx={{
              fontSize: "0.8rem",
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.90)",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            © {new Date().getFullYear()} BuildBlogs. Developed by BuildBlogs
            Developers.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
