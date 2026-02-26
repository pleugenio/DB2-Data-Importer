package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"db2-importer/services"

	"github.com/gin-gonic/gin"
)

func ImportData(c *gin.Context) {
	// 1. Get parameters
	tableName := c.PostForm("tableName")
	method := c.PostForm("method")
	columns := c.PostForm("columns")

	if tableName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tableName is required"})
		return
	}

	// 2. Handle file upload
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	// Create temp path
	tempDir := os.TempDir()
	filePath := filepath.Join(tempDir, file.Filename)
	logPath := filePath + ".log"

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to save file: %v", err)})
		return
	}

	// Ensure cleanup
	defer func() {
		os.Remove(filePath)
		os.Remove(logPath)
	}()

	// 3. Execute DB2 Import
	result, err := services.ExecuteDB2Import(filePath, tableName, method, columns, logPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  fmt.Sprintf("DB2 import failed: %v", err),
			"output": result,
		})
		return
	}

	// 4. Read log if it exists
	logContent, _ := os.ReadFile(logPath)

	c.JSON(http.StatusOK, gin.H{
		"message": "Import completed successfully",
		"output":  result,
		"log":     string(logContent),
	})
}
