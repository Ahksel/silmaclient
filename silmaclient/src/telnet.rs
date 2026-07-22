#[derive(Default)]
pub struct TelnetProcessor;

impl TelnetProcessor {
    pub fn process_server_data<'a>(&mut self, data: &'a [u8]) -> &'a [u8] {
        // The first milestone is byte-transparent. Telnet negotiation belongs here
        // when protocol support is added, rather than in the WebSocket bridge.
        data
    }
}

#[cfg(test)]
mod tests {
    use super::TelnetProcessor;

    #[test]
    fn initial_processor_passes_bytes_through() {
        let mut processor = TelnetProcessor;
        let data = b"Welcome\r\n";

        assert_eq!(processor.process_server_data(data), data);
    }
}
