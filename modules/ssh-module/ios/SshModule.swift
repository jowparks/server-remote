import ExpoModulesCore

struct TransferProgressSwift: Record {
  @Field
  var transferred: String
  @Field
  var total: String
}

struct ConnectionDetails {
    var user: String
    var password: String?
    var key: String?
    var address: String
}

public class SshModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  var session: Session?
    
  var connectionDetails: ConnectionDetails?
    
    func reconnect() async throws -> Session {
        guard let connectionDetails = self.connectionDetails else {
            throw NSError(domain: "app.reflect.serverremote", code: 1, userInfo: [NSLocalizedDescriptionKey: "Session is null"])
        }
        guard let session = self.session else {
            try await connection(user: connectionDetails.user, password: connectionDetails.password, key: connectionDetails.key, addrs: connectionDetails.address)
            throw NSError(domain: "app.reflect.serverremote", code: 1, userInfo: [NSLocalizedDescriptionKey: "unreachable"])
        }
        do {
            _ = try await session.testConnection()
        } catch {
            print("test_connection error: "+String(describing: error))
            try await connection(user: connectionDetails.user, password: connectionDetails.password, key: connectionDetails.key, addrs: connectionDetails.address)
        }
        return self.session!
    }
    
    func connection(user: String, password: String?, key: String?, addrs: String) async throws -> Void {
        guard password?.isEmpty == false || key?.isEmpty == false else {
            throw NSError(domain: "app.reflect.serverremote", code: 1, userInfo: [NSLocalizedDescriptionKey: "Please input password or key"])
        }
        if password?.isEmpty == false {
            try await connectionPassword(user: user, password: password!, addrs: addrs)
        } else {
            try await connectionKey(user: user, password: password, key: key!, addrs: addrs)
        }

    }
    
    func connectionPassword(user: String, password: String, addrs: String) async throws -> Void {
        do {
            self.session = try connect(user: user, password: password, addrs: addrs)
            self.connectionDetails = ConnectionDetails(user: user, password: password, address: addrs)
        } catch {
            print("connect error: "+String(describing: error))
            throw error
        }
    }

    func connectionKey(user: String, password: String?, key: String, addrs: String) async throws -> Void {
        do {
            self.session = try connectKey(user: user, key: key, password: password, addrs: addrs)
            self.connectionDetails = ConnectionDetails(user: user, password: password, address: addrs)
        } catch {
            print("connect error: "+String(describing: error))
            throw error
        }
    }

  
  public func definition() -> ModuleDefinition {

    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('SshModule')` in JavaScript.
    Name("SshModule")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("exec")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("connect") { (user: String, password: String, key: String?, addrs: String) async throws -> Void in
        try await connection(user: user, password: password, key: key, addrs: addrs)
    }

    AsyncFunction("exec") { (commandId: String, command: String) async throws -> String in

        let session = try await self.reconnect()
        
        let isCompleted = IsCompleted()

        @Sendable func getData() async throws {
            do {
                while let data = try await session.readOutput(commandId: commandId) {
                    print("exec data: "+String(describing: data))
                    self.sendEvent("exec", ["commandId": commandId, "data": data])
                }
            } catch {
                print("read output error: "+String(describing: error))
                throw error
            }
        }

        let task = Task {
            while true {
                let isCompleted = await isCompleted.get()
                if isCompleted {
                    break
                }
                try await Task.sleep(nanoseconds: 100_000_000) // Sleep for 100ms
                try await getData()
            }
        }
        
        do {
            let returnCode = try await session.exec(commandId: commandId, command: command)
            await isCompleted.set(true)
            try await task.value
            try await getData()
            self.sendEvent("exec", ["commandId": commandId, "data": "eventingComplete"])
            
            return returnCode
        } catch {
            print("exec error: "+String(describing: error))
            throw error
        }
    }
      
      AsyncFunction("cancel") { (id: String) async throws -> String in
          let session = try await self.reconnect()

          try await session.cancel(id: id)
          return "0"
      }
      
      AsyncFunction("transfer") { (transferId: String, sourcePath: String, destinationPath: String, direction: String) async throws -> String in
          let session = try await self.reconnect()

          do {
              print("trying transfer")
              print(transferId, sourcePath, destinationPath, direction)
              try await session.transfer(transferId: transferId, sourcePath: sourcePath, destinationPath: destinationPath, direction: direction)
              print("success")
          } catch {
              print("transfer error: "+String(describing: error))
              throw error
          }
          return "0"
      }
      // TODO: wrap all these functions in an inner function, retry once with a reconnect if there is an error
      AsyncFunction("transferProgress") { (transferId: String) async throws -> TransferProgressSwift in
          let session = try await self.reconnect()

          do {
              let progress = try await session.transferProgress(transferId: transferId)
              return TransferProgressSwift(
                transferred: Field(wrappedValue: String(progress.transferred)),
                total: Field(wrappedValue: String(progress.total))
              )
          } catch {
              print("transfer progress error: "+String(describing: error))
              throw error
          }
      }

  }
}

actor IsCompleted {
    private var isCompleted = false
    func get() -> Bool {
        return isCompleted
    }
    func set(_ value: Bool) {
        isCompleted = value
    }
}
