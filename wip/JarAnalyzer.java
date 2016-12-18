package oracle.jest;

import java.io.IOException;
import java.io.InputStream;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;


/**
 * Ananlyze an archive to answer if particulr resource is available.
 * 
 * @author pinaki poddar
 *
 */
public class JarAnalyzer {
    private final JarInputStream _jar;
    
    public JarAnalyzer(String name, InputStream jar)  throws IOException  {
        _jar = new JarInputStream(jar, true);
        
        System.err.println("Creating analyzer " + name);
    }
    
    public boolean exists(String resource) throws IOException {
        JarEntry entry = null;
        while ((entry = _jar.getNextJarEntry()) != null) {
            if (entry.getName().endsWith(resource)) {
                System.err.println("found " + entry.getName());
                return true;
            }
            
            JarEntryStream in = new JarEntryStream(entry);
            if (entry.getName().endsWith(".jar")) {
                System.err.println("searching inside " + entry.getName());
                try {
                    JarAnalyzer y = new JarAnalyzer(entry.getName(), in);
                    if (y.exists(resource)) {
                        System.err.println("Found " + resource + " inside " + entry.getName());
                        return true;
                    }
                } catch (IOException ex) {
                    
                }
            } else {
                for (long i = 0; i < entry.getSize(); i++) _jar.read();
            }
        }
        return false;
    }
    
    class JarEntryStream extends InputStream {
        private long _remaining;
        private final byte[] _buffer;
        private int _cursor = 0;
        private long _bufferLimit = 0;
        private long _count;
        
        public JarEntryStream(JarEntry entry) {
            _remaining = entry.getSize();
            _buffer = new byte[1024]; 
        }
        @Override
        public int read() throws IOException {
            if (_remaining < 0) {
                System.err.println("finished reading entry " + _count + " bytes");
                return -1;
            }
            if (_cursor < _bufferLimit) {
                _remaining--;
                _count++;
                return _buffer[_cursor++];
            }
            
            long L = Math.min(1024, _remaining);
                    
            _bufferLimit = _jar.read(_buffer, _cursor = 0, (int)L);
            if (_bufferLimit < 0) {
                System.err.println("finished reading entry " + _count + " bytes");
                return -1;
            }
            _remaining--;
            _count++;
            return _buffer[_cursor++];
        }
        
        
        
    }

}
