package services

import (
	"fmt"
	"os/exec"
	"runtime"
)

func ExecuteDB2Import(filePath, tableName, method, columns, logPath string) (string, error) {
	// Construct the DB2 command
	// Example: IMPORT FROM "/tmp/CLARO_FEV.txt" OF DEL MODIFIED BY COLDEL; METHOD P (1, 2, 3, 4, 6, 7) MESSAGES "/tmp/CLARO_FEV.log" INSERT INTO ipt.importacao_telefones_claro_fev_2026

	// Note: We need to use 'db2' command which usually requires the DB2 environment to be set up.
	// On Windows, it might need to be run through 'db2cmd'.

	importCmd := fmt.Sprintf("IMPORT FROM '%s' OF DEL MODIFIED BY COLDEL", filePath)

	if method != "" && columns != "" {
		importCmd += fmt.Sprintf(" METHOD %s (%s)", method, columns)
	}

	importCmd += fmt.Sprintf(" MESSAGES '%s' INSERT INTO %s", logPath, tableName)

	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		// On Windows, db2 commands often need to run inside a db2cmd session
		cmd = exec.Command("db2cmd", "/c", "/i", "/w", "db2", "CONNECT TO APNPRD;", "db2", importCmd)
	} else {
		cmd = exec.Command("db2", "CONNECT TO APNPRD;", "db2", importCmd)
	}

	output, err := cmd.CombinedOutput()
	return string(output), err
}
