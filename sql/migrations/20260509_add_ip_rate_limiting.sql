-- Create rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    ip_address TEXT NOT NULL,
    action_type TEXT NOT NULL,
    request_count INT DEFAULT 1,
    last_request_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (ip_address, action_type)
);

-- Enable RLS (Service Role only)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RPC to check and increment rate limits atomically
CREATE OR REPLACE FUNCTION check_ip_rate_limit(
    p_ip_address TEXT,
    p_action_type TEXT,
    p_max_requests INT,
    p_window_seconds INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
    v_last_request TIMESTAMPTZ;
BEGIN
    -- Select current record for this IP and Action
    SELECT request_count, last_request_at 
    INTO v_count, v_last_request
    FROM rate_limits 
    WHERE ip_address = p_ip_address AND action_type = p_action_type
    FOR UPDATE; -- Lock for concurrent requests

    IF NOT FOUND THEN
        -- First time
        INSERT INTO rate_limits (ip_address, action_type, request_count, last_request_at)
        VALUES (p_ip_address, p_action_type, 1, NOW());
        RETURN TRUE;
    END IF;

    -- If the window has passed, reset
    IF NOW() > v_last_request + (p_window_seconds || ' seconds')::interval THEN
        UPDATE rate_limits 
        SET request_count = 1, last_request_at = NOW()
        WHERE ip_address = p_ip_address AND action_type = p_action_type;
        RETURN TRUE;
    END IF;

    -- If within window but limit exceeded
    IF v_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;

    -- Otherwise, increment
    UPDATE rate_limits 
    SET request_count = request_count + 1, last_request_at = NOW()
    WHERE ip_address = p_ip_address AND action_type = p_action_type;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
