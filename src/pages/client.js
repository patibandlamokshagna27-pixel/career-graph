const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const buildUrl = (path) => {
  if (!path) return API_BASE_URL;

  // Already a complete URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Avoid duplicate /api
  if (path.startsWith("/api/")) {
    return `${API_BASE_URL}${path}`;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};

const parseResponse = async (response) => {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      message: text,
    };
  }

  if (!response.ok) {
    const error = new Error(
      data?.detail ||
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export const apiClient = {
  async get(path, options = {}) {
    const response = await fetch(buildUrl(path), {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    return parseResponse(response);
  },

  async post(path, body = {}, options = {}) {
    const isFormData = body instanceof FormData;

    const response = await fetch(buildUrl(path), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(isFormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),
        ...(options.headers || {}),
      },
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });

    return parseResponse(response);
  },

  async postForm(path, formData, options = {}) {
    const response = await fetch(buildUrl(path), {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
      body: formData,
      ...options,
    });

    return parseResponse(response);
  },

  async put(path, body = {}, options = {}) {
    const response = await fetch(buildUrl(path), {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
      ...options,
    });

    return parseResponse(response);
  },

  async delete(path, options = {}) {
    const response = await fetch(buildUrl(path), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    return parseResponse(response);
  },
};

export default apiClient;