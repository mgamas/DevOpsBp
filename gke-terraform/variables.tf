variable "project_id" {
  description = "The ID of the project in which to create the cluster"
  type        = string
}

variable "region" {
  description = "The region in which to create the cluster"
  type        = string
  default     = "us-east1-b"
}
