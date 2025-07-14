import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Alert,
  Divider,
  Tooltip,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { logger } from "../utils/logger";

interface UrlInput {
  url: string;
  validity: string;
  shortcode: string;
  error?: string;
}

const MAX_URLS = 5;
const API_BASE = "";

const UrlShortenerPage: React.FC = () => {
  const [inputs, setInputs] = useState<UrlInput[]>([
    { url: "", validity: "", shortcode: "" },
  ]);
  const [results, setResults] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleInputChange = (
    idx: number,
    field: keyof UrlInput,
    value: string
  ) => {
    const newInputs = [...inputs];
    newInputs[idx][field] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < MAX_URLS) {
      setInputs([...inputs, { url: "", validity: "", shortcode: "" }]);
    }
  };

  const removeInput = (idx: number) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((_, i) => i !== idx));
    }
  };

  const validateInput = (input: UrlInput): string | null => {
    if (!input.url.trim()) return "URL is required";
    if (!/^https?:\/\//.test(input.url.trim()))
      return "URL must start with http:// or https://";
    if (
      input.validity &&
      (!/^[0-9]+$/.test(input.validity) || parseInt(input.validity) <= 0)
    )
      return "Validity must be a positive integer";
    if (input.shortcode && !/^[a-zA-Z0-9]+$/.test(input.shortcode))
      return "Shortcode must be alphanumeric";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResults([]);
    setError(null);

    const newInputs = inputs.map((input) => ({
      ...input,
      error: validateInput(input) || undefined,
    }));
    setInputs(newInputs);
    if (newInputs.some((input) => input.error)) {
      setSubmitting(false);
      return;
    }

    logger.info("page", "Submitting URL shortening requests");

    try {
      const promises = newInputs.map((input) =>
        axios.post(`${API_BASE}/shorturls`, {
          url: input.url,
          validity: input.validity ? parseInt(input.validity) : undefined,
          shortcode: input.shortcode || undefined,
        })
      );
      const responses = await Promise.allSettled(promises);
      const resultData = responses.map((res, idx) => {
        if (res.status === "fulfilled") {
          logger.info("api", `Shortened URL created for ${newInputs[idx].url}`);
          return {
            originalUrl: newInputs[idx].url,
            ...res.value.data,
          };
        } else {
          logger.error(
            "api",
            `Failed to shorten URL: ${newInputs[idx].url} - ${
              res.reason?.response?.data?.message || res.reason
            }`
          );
          return {
            originalUrl: newInputs[idx].url,
            error: res.reason?.response?.data?.message || "Unknown error",
          };
        }
      });
      setResults(resultData);
      // Store successful results in localStorage for statistics
      const successful = resultData.filter((r) => !r.error);
      if (successful.length > 0) {
        const prev = JSON.parse(localStorage.getItem("shortenedUrls") || "[]");
        localStorage.setItem(
          "shortenedUrls",
          JSON.stringify([...prev, ...successful])
        );
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
      logger.fatal(
        "page",
        `Unexpected error during URL shortening: ${err.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Shorten URLs
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: "text.secondary" }}>
        Enter up to 5 URLs to shorten. Optionally set validity (minutes) and a
        custom shortcode.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {inputs.map((input, idx) => (
            <Grid item xs={12} key={idx}>
              <Card
                elevation={3}
                sx={{ borderRadius: 3, background: "#fafbfc" }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        label="Long URL"
                        value={input.url}
                        onChange={(e) =>
                          handleInputChange(idx, "url", e.target.value)
                        }
                        fullWidth
                        required
                        error={!!input.error}
                        helperText={input.error}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Validity (minutes)"
                        value={input.validity}
                        onChange={(e) =>
                          handleInputChange(idx, "validity", e.target.value)
                        }
                        fullWidth
                        type="number"
                        inputProps={{ min: 1, max: 1440 }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Custom Shortcode"
                        value={input.shortcode}
                        onChange={(e) =>
                          handleInputChange(idx, "shortcode", e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <Tooltip title="Remove this URL">
                        <span>
                          <IconButton
                            onClick={() => removeInput(idx)}
                            disabled={inputs.length === 1}
                            color="error"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addInput}
              disabled={inputs.length >= MAX_URLS}
              sx={{ mb: 2 }}
            >
              Add URL
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              size="large"
              sx={{ px: 4, py: 1.5, fontWeight: 600 }}
            >
              {submitting ? "Shortening..." : "Shorten URLs"}
            </Button>
          </Grid>
        </Grid>
      </form>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {results.length > 0 && (
        <Box mt={5}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Results
          </Typography>
          <Grid container spacing={3}>
            {results.map((result, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    background: result.error ? "#fff0f0" : "#f6fff6",
                  }}
                >
                  <CardContent>
                    <Typography sx={{ mb: 1 }}>
                      <b>Original URL:</b> {result.originalUrl}
                    </Typography>
                    {result.error ? (
                      <Alert severity="error">
                        <b>Error:</b> {result.error}
                      </Alert>
                    ) : (
                      <>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography>
                            <b>Short Link:</b>
                          </Typography>
                          <a
                            href={result.shortLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {result.shortLink}
                          </a>
                          <Tooltip
                            title={
                              copied === result.shortLink
                                ? "Copied!"
                                : "Copy to clipboard"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(result.shortLink)}
                              color={
                                copied === result.shortLink
                                  ? "success"
                                  : "primary"
                              }
                            >
                              {copied === result.shortLink ? (
                                <CheckCircleIcon />
                              ) : (
                                <ContentCopyIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography sx={{ mt: 1 }}>
                          <b>Expiry:</b> {result.expiry}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      <Snackbar
        open={!!copied}
        autoHideDuration={1500}
        onClose={() => setCopied(null)}
        message="Short link copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default UrlShortenerPage;
