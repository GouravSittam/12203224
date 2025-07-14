import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import { logger } from "../utils/logger";

const API_BASE = "";

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const stored = JSON.parse(
          localStorage.getItem("shortenedUrls") || "[]"
        );
        if (!stored.length) {
          setStats([]);
          setLoading(false);
          return;
        }
        logger.info("page", "Fetching statistics for all shortened URLs");
        const promises = stored.map((item: any) =>
          axios.get(`${API_BASE}/shorturls/${item.shortLink.split("/").pop()}`)
        );
        const responses = await Promise.allSettled(promises);
        const statData = responses.map((res, idx) => {
          if (res.status === "fulfilled") {
            logger.info("api", `Fetched stats for ${stored[idx].shortLink}`);
            return {
              shortLink: stored[idx].shortLink,
              ...res.value.data,
            };
          } else {
            logger.error(
              "api",
              `Failed to fetch stats for ${stored[idx].shortLink}: ${
                res.reason?.response?.data?.message || res.reason
              }`
            );
            return {
              shortLink: stored[idx].shortLink,
              error: res.reason?.response?.data?.message || "Unknown error",
            };
          }
        });
        setStats(statData);
      } catch (err: any) {
        setError("Failed to fetch statistics.");
        logger.fatal("page", `Failed to fetch statistics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Shortened URL Statistics
      </Typography>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {!loading && stats.length === 0 && !error && (
        <Typography>No statistics available yet.</Typography>
      )}
      {!loading &&
        stats.length > 0 &&
        stats.map((stat, idx) => (
          <Paper key={idx} sx={{ p: 2, mb: 3 }}>
            <Typography>
              <b>Short Link:</b>{" "}
              <a
                href={stat.shortLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {stat.shortLink}
              </a>
            </Typography>
            {stat.error ? (
              <Typography color="error">
                <b>Error:</b> {stat.error}
              </Typography>
            ) : (
              <>
                <Typography>
                  <b>Created At:</b> {stat.createdAt}
                </Typography>
                <Typography>
                  <b>Expiry:</b> {stat.expiryDate}
                </Typography>
                <Typography>
                  <b>Total Clicks:</b> {stat.totalClicks}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Click Details:
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Referrer</TableCell>
                        <TableCell>Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stat.clicks.map((click: any, cidx: number) => (
                        <TableRow key={cidx}>
                          <TableCell>{click.timestamp}</TableCell>
                          <TableCell>{click.referrer || "-"}</TableCell>
                          <TableCell>{click.location || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        ))}
    </Box>
  );
};

export default StatisticsPage;
