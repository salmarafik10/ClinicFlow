const secured = [{ bearerAuth: [] }];
const idParam = { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } };
const json = (schema: unknown) => ({ "application/json": { schema } });
const ok = (description: string, schema?: unknown) => ({
  description,
  ...(schema ? { content: json(schema) } : {}),
});
const errors = {
  "400": { description: "Données invalides" },
  "401": { description: "Non authentifié" },
  "403": { description: "Accès refusé" },
  "404": { description: "Introuvable" },
  "409": { description: "Conflit (doublon ou règle des 30 minutes)" },
};

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "ClinicFlow API",
    version: "1.0.0",
    description: "API de gestion des patients et rendez-vous d'une clinique.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Patient: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          cin: { type: "string" },
          phone: { type: "string" },
          birthDate: { type: "string", format: "date" },
          address: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      PatientInput: {
        type: "object",
        required: ["fullName", "cin", "phone", "birthDate"],
        properties: {
          fullName: { type: "string" },
          cin: { type: "string" },
          phone: { type: "string" },
          birthDate: { type: "string", format: "date" },
          address: { type: "string", nullable: true },
        },
      },
      Appointment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          patientId: { type: "string", format: "uuid" },
          appointmentDate: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["pending", "confirmed", "cancelled"] },
          reason: { type: "string" },
          notes: { type: "string", nullable: true },
        },
      },
      AppointmentInput: {
        type: "object",
        required: ["patientId", "appointmentDate", "reason"],
        properties: {
          patientId: { type: "string", format: "uuid" },
          appointmentDate: { type: "string", format: "date-time" },
          reason: { type: "string" },
          notes: { type: "string", nullable: true },
          status: { type: "string", enum: ["pending", "confirmed"], default: "pending" },
        },
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Connexion (email + mot de passe)",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["email", "password"],
            properties: { email: { type: "string" }, password: { type: "string" } },
          }),
        },
        responses: { "200": ok("Token JWT et utilisateur"), "400": errors["400"], "401": errors["401"] },
      },
    },
    "/auth/me": {
      get: { tags: ["Auth"], summary: "Utilisateur connecté", security: secured, responses: { "200": ok("Utilisateur"), "401": errors["401"] } },
    },
    "/patients": {
      get: {
        tags: ["Patients"],
        summary: "Liste paginée avec recherche (nom ou CIN)",
        security: secured,
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: { "200": ok("Liste paginée"), "401": errors["401"] },
      },
      post: {
        tags: ["Patients"],
        summary: "Créer un patient",
        security: secured,
        requestBody: { required: true, content: json({ $ref: "#/components/schemas/PatientInput" }) },
        responses: { "201": ok("Patient créé", { $ref: "#/components/schemas/Patient" }), "400": errors["400"], "409": errors["409"] },
      },
    },
    "/patients/deleted": {
      get: { tags: ["Patients"], summary: "Patients supprimés (admin)", security: secured, responses: { "200": ok("Liste"), "403": errors["403"] } },
    },
    "/patients/{id}": {
      get: { tags: ["Patients"], summary: "Détails d'un patient et ses rendez-vous", security: secured, parameters: [idParam], responses: { "200": ok("Patient"), "404": errors["404"] } },
      put: {
        tags: ["Patients"],
        summary: "Modifier un patient",
        security: secured,
        parameters: [idParam],
        requestBody: { required: true, content: json({ $ref: "#/components/schemas/PatientInput" }) },
        responses: { "200": ok("Patient modifié"), "400": errors["400"], "404": errors["404"], "409": errors["409"] },
      },
      delete: { tags: ["Patients"], summary: "Supprimer (soft delete, admin)", security: secured, parameters: [idParam], responses: { "204": { description: "Supprimé" }, "403": errors["403"], "404": errors["404"] } },
    },
    "/patients/{id}/restore": {
      patch: { tags: ["Patients"], summary: "Restaurer un patient (admin)", security: secured, parameters: [idParam], responses: { "200": ok("Restauré"), "403": errors["403"], "404": errors["404"] } },
    },
    "/appointments": {
      get: {
        tags: ["Rendez-vous"],
        summary: "Liste filtrable par date et statut",
        security: secured,
        parameters: [
          { name: "date", in: "query", schema: { type: "string", format: "date" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["pending", "confirmed", "cancelled"] } },
        ],
        responses: { "200": ok("Liste"), "401": errors["401"] },
      },
      post: {
        tags: ["Rendez-vous"],
        summary: "Créer un rendez-vous (règle des 30 minutes sur les confirmés)",
        security: secured,
        requestBody: { required: true, content: json({ $ref: "#/components/schemas/AppointmentInput" }) },
        responses: { "201": ok("Créé", { $ref: "#/components/schemas/Appointment" }), "400": errors["400"], "404": errors["404"], "409": errors["409"] },
      },
    },
    "/appointments/{id}": {
      put: {
        tags: ["Rendez-vous"],
        summary: "Modifier date, motif ou notes",
        security: secured,
        parameters: [idParam],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            properties: { appointmentDate: { type: "string", format: "date-time" }, reason: { type: "string" }, notes: { type: "string", nullable: true } },
          }),
        },
        responses: { "200": ok("Modifié"), "404": errors["404"], "409": errors["409"] },
      },
    },
    "/appointments/{id}/status": {
      patch: {
        tags: ["Rendez-vous"],
        summary: "Changer le statut",
        security: secured,
        parameters: [idParam],
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["status"],
            properties: { status: { type: "string", enum: ["pending", "confirmed", "cancelled"] } },
          }),
        },
        responses: { "200": ok("Statut modifié"), "404": errors["404"], "409": errors["409"] },
      },
    },
    "/dashboard/stats": {
      get: { tags: ["Dashboard"], summary: "Statistiques", security: secured, responses: { "200": ok("Compteurs, graphique et prochains rendez-vous") } },
    },
    "/audit-logs": {
      get: { tags: ["Audit"], summary: "Journal d'audit (admin)", security: secured, responses: { "200": ok("Liste paginée"), "403": errors["403"] } },
    },
    "/users": {
      get: { tags: ["Utilisateurs"], summary: "Liste (admin)", security: secured, responses: { "200": ok("Liste"), "403": errors["403"] } },
      post: { tags: ["Utilisateurs"], summary: "Créer un utilisateur (admin)", security: secured, responses: { "201": ok("Créé"), "400": errors["400"], "409": errors["409"] } },
    },
    "/users/{id}": {
      patch: { tags: ["Utilisateurs"], summary: "Modifier rôle ou activer/désactiver (admin)", security: secured, parameters: [idParam], responses: { "200": ok("Modifié"), "400": errors["400"], "404": errors["404"] } },
    },
    "/users/me/password": {
      put: { tags: ["Utilisateurs"], summary: "Changer son mot de passe", security: secured, responses: { "204": { description: "Modifié" }, "400": errors["400"] } },
    },
  },
};