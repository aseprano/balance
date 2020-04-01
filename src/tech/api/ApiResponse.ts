export interface ApiResponse {
    getStatusCode(): number;
    getStatusMessage(): string;
    getBody(): string|undefined;
}
